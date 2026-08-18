"""
CreditBridge Preprocessing Pipeline
Provides unified, deterministic data transformation for training, inference, and simulation.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Optional
from sklearn.preprocessing import RobustScaler
from .features import ALL_FEATURE_COLUMNS, engineer_features, extract_feature_vector


class PreprocessingPipeline:
    def __init__(self, scaler_path: Optional[str] = None):
        self.scaler_path = scaler_path
        self.scaler = RobustScaler()
        self.is_fitted = False
        self.feature_names = ALL_FEATURE_COLUMNS

        if scaler_path and os.path.exists(scaler_path):
            self.load(scaler_path)

    def fit_transform(self, df_raw: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """
        Engineers features and fits robust scaler on training data.
        Returns scaled array and the enriched DataFrame.
        """
        df_enriched = engineer_features(df_raw)
        X_df = extract_feature_vector(df_enriched)
        
        # Handle potential NaNs or infs gracefully
        X_clean = X_df.replace([np.inf, -np.inf], np.nan).fillna(X_df.median())
        
        X_scaled = self.scaler.fit_transform(X_clean)
        self.is_fitted = True
        return X_scaled, X_clean

    def transform(self, df_raw: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """
        Transforms new raw records using fitted scaler.
        """
        df_enriched = engineer_features(df_raw)
        X_df = extract_feature_vector(df_enriched)
        X_clean = X_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)

        if self.is_fitted:
            X_scaled = self.scaler.transform(X_clean)
        else:
            X_scaled = X_clean.values

        return X_scaled, X_clean

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"scaler": self.scaler, "is_fitted": self.is_fitted, "feature_names": self.feature_names}, filepath)

    def load(self, filepath: str):
        data = joblib.load(filepath)
        self.scaler = data["scaler"]
        self.is_fitted = data["is_fitted"]
        self.feature_names = data.get("feature_names", ALL_FEATURE_COLUMNS)
