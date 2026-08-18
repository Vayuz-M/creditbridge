"""
CreditBridge SQLAlchemy Database Models
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # "USER" or "ADMIN"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profiles = relationship("FinancialProfile", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Income Features
    monthly_income = Column(Float, nullable=False)
    income_variability = Column(Float, default=0.25)
    income_regularity = Column(Float, default=0.85)
    income_sources = Column(Integer, default=1)

    # Transaction Features
    monthly_transaction_count = Column(Integer, default=45)
    average_transaction_value = Column(Float, default=450.0)
    transaction_consistency = Column(Float, default=0.80)
    digital_payment_ratio = Column(Float, default=0.85)

    # Utility Bills & Payments
    electricity_payment_consistency = Column(Float, default=0.90)
    mobile_payment_consistency = Column(Float, default=0.95)
    rent_payment_consistency = Column(Float, default=0.88)
    average_payment_delay = Column(Float, default=1.5)
    on_time_payment_ratio = Column(Float, default=0.92)

    # Savings
    monthly_savings = Column(Float, default=6000.0)
    savings_ratio = Column(Float, default=0.20)

    # Digital Footprint
    upi_activity_months = Column(Integer, default=24)
    digital_activity_months = Column(Integer, default=36)
    transaction_history_months = Column(Integer, default=24)

    # Demographic / Audit attributes (Fairness only)
    age_group = Column(String(50), default="25-34")
    gender = Column(String(50), default="Unspecified")
    occupation_category = Column(String(100), default="Gig Worker / Delivery")

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    assessments = relationship("Assessment", back_populates="financial_profile", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    financial_profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)

    # CreditBridge Trust Score & Classification
    trust_score = Column(Integer, nullable=False)              # 0 to 900
    score_band = Column(String(50), nullable=False)            # Excellent, Strong, Moderate, Developing, Higher Risk
    band_tier = Column(String(50), nullable=False)             # Tier 1: Prime, Tier 2: Near-Prime, etc.
    band_color = Column(String(20), default="#00f5d4")
    repayment_probability = Column(Float, nullable=False)      # 0.0 to 1.0
    risk_probability = Column(Float, nullable=False)           # 1.0 - repayment_probability

    # Metadata & Explainability Artifacts
    model_version = Column(String(50), default="v1.0")
    algorithm = Column(String(50), default="XGBoost")
    factor_ratings = Column(JSON, nullable=True)               # 5-factor ratings dict
    shap_explanation = Column(JSON, nullable=True)             # Local SHAP waterfall and narrative
    raw_features = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    financial_profile = relationship("FinancialProfile", back_populates="assessments")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String(50), nullable=False)             # XGBoost, LightGBM, Random Forest
    version = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=False)
    
    # Authentic Evaluation Metrics
    roc_auc = Column(Float, nullable=False)
    pr_auc = Column(Float, nullable=False)
    f1 = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    brier_score = Column(Float, default=0.12)
    confusion_matrix = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    
    dataset_records = Column(Integer, default=15000)
    training_date = Column(DateTime, default=datetime.utcnow)


class DatasetRecord(Base):
    __tablename__ = "dataset_records"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), nullable=False)
    records_count = Column(Integer, nullable=False)
    features_count = Column(Integer, default=23)
    class_balance = Column(JSON, nullable=True)                # e.g. {"positive": 72.4, "negative": 27.6}
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FairnessReport(Base):
    __tablename__ = "fairness_reports"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), default="v1.0")
    parity_difference = Column(Float, nullable=False)
    equal_opportunity_difference = Column(Float, nullable=False)
    is_compliant = Column(Boolean, default=True)
    status_text = Column(Text, nullable=False)
    report_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
