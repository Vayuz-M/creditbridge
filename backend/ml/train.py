"""
CreditBridge Model Training & Evaluation Engine
Trains multiple candidate algorithms (XGBoost, LightGBM, Random Forest)
and records authentic performance metrics on a held-out test set.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple, Optional

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    brier_score_loss
)
import xgboost as xgb
import lightgbm as lgb

from .data_generator import SyntheticDataGenerator
from .preprocessing import PreprocessingPipeline
from .features import ALL_FEATURE_COLUMNS


def train_models(
    df: Optional[pd.DataFrame] = None,
    n_samples: int = 15000,
    models_dir: str = "backend/data/models",
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Trains XGBoost, LightGBM, and Random Forest models on synthetic alternative credit data.
    Computes rigorous, honest evaluation metrics and persists trained artifacts.
    """
    os.makedirs(models_dir, exist_ok=True)
    
    if df is None:
        generator = SyntheticDataGenerator(random_seed=random_seed)
        df = generator.generate_dataset(n_samples=n_samples)

    # Separate targets and audit features
    target_col = "repayment_outcome"
    audit_cols = ["age_group", "gender", "income_group", "occupation_category"]
    
    y = df[target_col].values
    audit_df = df[audit_cols].copy()

    # Stratified Train/Val/Test split (70% train, 15% validation, 15% test)
    X_train_raw, X_temp_raw, y_train, y_temp, audit_train, audit_temp = train_test_split(
        df, y, audit_df, test_size=0.30, random_state=random_seed, stratify=y
    )
    X_val_raw, X_test_raw, y_val, y_test, audit_val, audit_test = train_test_split(
        X_temp_raw, y_temp, audit_temp, test_size=0.50, random_state=random_seed, stratify=y_temp
    )

    # Fit unified preprocessing pipeline
    pipeline = PreprocessingPipeline()
    X_train, X_train_df = pipeline.fit_transform(X_train_raw)
    X_val, _ = pipeline.transform(X_val_raw)
    X_test, X_test_df = pipeline.transform(X_test_raw)

    # Save preprocessing pipeline
    scaler_path = os.path.join(models_dir, "preprocessor.joblib")
    pipeline.save(scaler_path)

    # Save test dataset and test audit slice for fairness evaluation and simulation
    test_eval_path = os.path.join(models_dir, "test_eval_data.joblib")
    joblib.dump({
        "X_test_raw": X_test_raw,
        "X_test_scaled": X_test,
        "X_test_df": X_test_df,
        "y_test": y_test,
        "audit_test": audit_test
    }, test_eval_path)

    results = {}
    timestamp = datetime.utcnow().isoformat()

    # 1. XGBoost (Primary Production Model)
    xgb_model = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=4,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=random_seed
    )
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False
    )
    results["xgboost"] = _evaluate_and_save_model(
        xgb_model, "XGBoost", "v1.0", X_test, y_test, models_dir, "xgboost_model.joblib", timestamp
    )

    # 2. LightGBM (Candidate Secondary Model)
    lgb_model = lgb.LGBMClassifier(
        n_estimators=180,
        max_depth=4,
        num_leaves=15,
        learning_rate=0.06,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=random_seed,
        verbose=-1
    )
    lgb_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(stopping_rounds=30, verbose=False)]
    )
    results["lightgbm"] = _evaluate_and_save_model(
        lgb_model, "LightGBM", "v1.0", X_test, y_test, models_dir, "lightgbm_model.joblib", timestamp
    )

    # 3. Random Forest (Baseline Model)
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=6,
        random_state=random_seed,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    results["random_forest"] = _evaluate_and_save_model(
        rf_model, "Random Forest", "v1.0", X_test, y_test, models_dir, "random_forest_model.joblib", timestamp
    )

    # Mark XGBoost as active default model
    metadata = {
        "active_model": "xgboost",
        "active_model_name": "XGBoost",
        "model_version": "v1.0",
        "training_date": timestamp,
        "dataset_records": len(df),
        "feature_count": len(ALL_FEATURE_COLUMNS),
        "models": results
    }

    metadata_path = os.path.join(models_dir, "models_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


def _evaluate_and_save_model(
    model: Any,
    name: str,
    version: str,
    X_test: np.ndarray,
    y_test: np.ndarray,
    models_dir: str,
    filename: str,
    timestamp: str
) -> Dict[str, Any]:
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.50).astype(int)

    roc_auc = float(roc_auc_score(y_test, y_prob))
    pr_auc = float(average_precision_score(y_test, y_prob))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    brier = float(brier_score_loss(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Save model artifact
    model_path = os.path.join(models_dir, filename)
    joblib.dump(model, model_path)

    return {
        "algorithm": name,
        "version": version,
        "filename": filename,
        "training_date": timestamp,
        "metrics": {
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "brier_score": round(brier, 4),
            "confusion_matrix": cm,
            "sample_size": len(y_test)
        }
    }
