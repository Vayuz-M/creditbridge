"""
CreditBridge System Initialization Script
Generates synthetic dataset, trains ML candidate models, and seeds demo assessments.
"""

import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml.data_generator import SyntheticDataGenerator, get_default_sample_personas
from ml.train import train_models
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.models import User, FinancialProfile, Assessment
from app.auth.auth import get_password_hash
from ml.predict import Predictor
from ml.explain import ShapExplainer


def initialize_creditbridge():
    print("[INFO] Initializing CreditBridge Platform...")
    
    # 1. Ensure directories exist
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.MODELS_DIR, exist_ok=True)
    os.makedirs(settings.DATASETS_DIR, exist_ok=True)

    # 2. Generate Synthetic Dataset (15,000 records)
    dataset_path = os.path.join(settings.DATASETS_DIR, "synthetic_credit_data.csv")
    print(f"[INFO] Generating realistic synthetic dataset (15,000 records) -> {dataset_path}")
    generator = SyntheticDataGenerator(random_seed=42)
    df = generator.generate_dataset(n_samples=15000)
    df.to_csv(dataset_path, index=False)
    pos_count = int((df['repayment_outcome'] == 1).sum())
    neg_count = int((df['repayment_outcome'] == 0).sum())
    print(f"[OK] Generated {len(df)} synthetic records. Target balance: {pos_count} positive / {neg_count} negative.")

    # 3. Train Candidate ML Models (XGBoost, LightGBM, Random Forest)
    print("[INFO] Training and evaluating candidate models (XGBoost, LightGBM, Random Forest)...")
    train_metadata = train_models(
        df=df,
        models_dir=settings.MODELS_DIR,
        random_seed=42
    )
    print("[OK] Model training complete. Authentic Evaluation Metrics on Test Set:")
    for m_key, m_val in train_metadata["models"].items():
        metrics = m_val["metrics"]
        print(f"   * {m_val['algorithm']} -> ROC-AUC: {metrics['roc_auc']}, PR-AUC: {metrics['pr_auc']}, F1: {metrics['f1']}, Recall: {metrics['recall']}")

    # 4. Initialize Database Tables
    print("[INFO] Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed Users
        admin_user = db.query(User).filter(User.email == "admin@creditbridge.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@creditbridge.ai",
                hashed_password=get_password_hash("CreditBridge2026!"),
                full_name="System Administrator",
                role="ADMIN"
            )
            db.add(admin_user)

        demo_user = db.query(User).filter(User.email == "demo.user@creditbridge.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo.user@creditbridge.ai",
                hashed_password=get_password_hash("CreditBridge2026!"),
                full_name="Arjun Sharma (Gig Worker)",
                role="USER"
            )
            db.add(demo_user)
        
        db.commit()
        db.refresh(demo_user)

        # Seed sample assessments for demo personas
        predictor = Predictor(models_dir=settings.MODELS_DIR)
        shap_explainer = ShapExplainer(models_dir=settings.MODELS_DIR)
        personas = get_default_sample_personas()
        
        for key, p_data in personas.items():
            profile_data = p_data.copy()
            p_name = profile_data.pop("name")
            
            fp = FinancialProfile(
                user_id=demo_user.id,
                **profile_data
            )
            db.add(fp)
            db.commit()
            db.refresh(fp)

            pred_res = predictor.predict_profile(profile_data)
            shap_res = shap_explainer.explain_profile(profile_data, pred_res["trust_score"])

            assessment = Assessment(
                user_id=demo_user.id,
                financial_profile_id=fp.id,
                trust_score=pred_res["trust_score"],
                score_band=pred_res["score_band"],
                band_tier=pred_res["band_tier"],
                band_color=pred_res["band_color"],
                repayment_probability=pred_res["repayment_probability"],
                risk_probability=pred_res["risk_probability"],
                model_version=pred_res["model_version"],
                algorithm=pred_res["algorithm"],
                factor_ratings=pred_res["factor_ratings"],
                shap_explanation=shap_res,
                raw_features=pred_res["raw_features"]
            )
            db.add(assessment)
            db.commit()

        print("[OK] Seeded sample assessments for demo personas.")
    finally:
        db.close()

    print("[SUCCESS] CreditBridge System Initialized Successfully!")


if __name__ == "__main__":
    initialize_creditbridge()
