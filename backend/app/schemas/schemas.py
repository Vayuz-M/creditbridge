"""
CreditBridge Pydantic Validation & Serialization Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ---------------- Auth Schemas ----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: Optional[str] = "USER"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class DemoLoginRequest(BaseModel):
    role: str = "USER"  # "USER" or "ADMIN"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- Financial Profile Schemas ----------------
class FinancialProfileCreate(BaseModel):
    # Income
    monthly_income: float = Field(..., ge=5000, le=1000000)
    income_variability: float = Field(default=0.25, ge=0.0, le=1.0)
    income_regularity: float = Field(default=0.85, ge=0.0, le=1.0)
    income_sources: int = Field(default=1, ge=1, le=10)

    # Transactions
    monthly_transaction_count: int = Field(default=45, ge=1, le=500)
    average_transaction_value: float = Field(default=450.0, ge=10, le=100000)
    transaction_consistency: float = Field(default=0.80, ge=0.0, le=1.0)
    digital_payment_ratio: float = Field(default=0.85, ge=0.0, le=1.0)

    # Utility Bills & Payments
    electricity_payment_consistency: float = Field(default=0.90, ge=0.0, le=1.0)
    mobile_payment_consistency: float = Field(default=0.95, ge=0.0, le=1.0)
    rent_payment_consistency: float = Field(default=0.88, ge=0.0, le=1.0)
    average_payment_delay: float = Field(default=1.5, ge=0.0, le=90.0)
    on_time_payment_ratio: float = Field(default=0.92, ge=0.0, le=1.0)

    # Savings
    monthly_savings: float = Field(default=6000.0, ge=0.0)
    savings_ratio: Optional[float] = None

    # Digital Footprint
    upi_activity_months: int = Field(default=24, ge=1, le=120)
    digital_activity_months: int = Field(default=36, ge=1, le=120)
    transaction_history_months: int = Field(default=24, ge=1, le=120)

    # Demographic / Audit Slices (Fairness only)
    age_group: Optional[str] = "25-34"
    gender: Optional[str] = "Unspecified"
    occupation_category: Optional[str] = "Gig Worker / Delivery"


# ---------------- Assessment & Scoring Schemas ----------------
class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    trust_score: int
    score_band: str
    band_tier: str
    band_color: str
    repayment_probability: float
    risk_probability: float
    model_version: str
    algorithm: str
    factor_ratings: Dict[str, Any]
    shap_explanation: Optional[Dict[str, Any]] = None
    raw_features: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentSummary(BaseModel):
    id: int
    trust_score: int
    score_band: str
    band_tier: str
    band_color: str
    repayment_probability: float
    algorithm: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------- Simulation Schemas ----------------
class SimulationRequest(BaseModel):
    baseline_profile: Dict[str, Any]
    modified_features: Dict[str, Any]


class SimulationResponse(BaseModel):
    current_score: int
    current_band: str
    simulated_score: int
    simulated_band: str
    score_delta: int
    simulated_repayment_probability: float
    factor_changes: List[Dict[str, Any]]
    disclaimer: str = "Model Simulation — Not a Guaranteed Future Score"


# ---------------- Admin & Monitoring Schemas ----------------
class ModelTrainRequest(BaseModel):
    n_samples: int = 15000
    random_seed: int = 42


class DatasetGenerateRequest(BaseModel):
    n_samples: int = 20000


class ModelActivateRequest(BaseModel):
    model_key: str  # "xgboost", "lightgbm", "random_forest"
