"""
CreditBridge Assessment, Trust Scoring & Simulation Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models.models import User, FinancialProfile, Assessment
from ..schemas.schemas import FinancialProfileCreate, AssessmentResponse, AssessmentSummary, SimulationRequest, SimulationResponse
from ..auth.auth import get_current_user
from ml.predict import Predictor, SCORE_BANDS
from ml.explain import ShapExplainer
from ml.features import engineer_features, ALL_FEATURE_COLUMNS

router = APIRouter(prefix="/assessment", tags=["Assessments & Scoring"])

# Initialize ML engines
predictor = Predictor()
shap_explainer = ShapExplainer()


@router.post("", response_model=AssessmentResponse)
def create_assessment(
    profile_in: FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a financial profile, runs ML feature engineering & risk model,
    generates 0-900 CreditBridge Trust Score, and computes local SHAP attributions.
    """
    # Compute savings ratio if not provided
    calculated_savings_ratio = profile_in.savings_ratio
    if calculated_savings_ratio is None:
        calculated_savings_ratio = profile_in.monthly_savings / max(profile_in.monthly_income, 1.0)

    # 1. Save Financial Profile to DB
    profile_data = profile_in.model_dump()
    profile_data["savings_ratio"] = calculated_savings_ratio
    db_profile = FinancialProfile(
        user_id=current_user.id,
        **profile_data
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    # 2. Run Model Inference
    pred_result = predictor.predict_profile(profile_data)

    # 3. Compute Local SHAP Explanation
    shap_result = shap_explainer.explain_profile(profile_data, pred_result["trust_score"])

    # 4. Save Assessment Record
    assessment = Assessment(
        user_id=current_user.id,
        financial_profile_id=db_profile.id,
        trust_score=pred_result["trust_score"],
        score_band=pred_result["score_band"],
        band_tier=pred_result["band_tier"],
        band_color=pred_result["band_color"],
        repayment_probability=pred_result["repayment_probability"],
        risk_probability=pred_result["risk_probability"],
        model_version=pred_result["model_version"],
        algorithm=pred_result["algorithm"],
        factor_ratings=pred_result["factor_ratings"],
        shap_explanation=shap_result,
        raw_features=pred_result["raw_features"]
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


@router.get("/history", response_model=List[AssessmentSummary])
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves user's assessment history in chronological order."""
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.created_at.desc()).all()
    return assessments


@router.get("/latest", response_model=AssessmentResponse)
def get_latest_assessment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves user's most recent credit score assessment."""
    assessment = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.created_at.desc()).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assessments found for this user. Please submit a financial profile."
        )
    return assessment


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves detailed assessment record by ID."""
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if assessment.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized access to this assessment.")

    return assessment


@router.post("/simulate", response_model=SimulationResponse)
def simulate_score(
    sim_req: SimulationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Interactive 'What-If' simulator: Runs real ML model inference on hypothetical financial adjustments.
    Returns dynamic score delta and factor impact without persisting speculative data.
    """
    # 1. Baseline assessment
    baseline_pred = predictor.predict_profile(sim_req.baseline_profile)
    current_score = baseline_pred["trust_score"]
    current_band = baseline_pred["score_band"]

    # 2. Merge modified features
    simulated_profile = sim_req.baseline_profile.copy()
    simulated_profile.update(sim_req.modified_features)

    # Re-calculate savings ratio if monthly_savings or monthly_income changed
    if "monthly_savings" in simulated_profile and "monthly_income" in simulated_profile:
        simulated_profile["savings_ratio"] = simulated_profile["monthly_savings"] / max(simulated_profile["monthly_income"], 1.0)

    # 3. Predict simulated score with actual ML model
    sim_pred = predictor.predict_profile(simulated_profile)
    simulated_score = sim_pred["trust_score"]
    simulated_band = sim_pred["score_band"]
    score_delta = simulated_score - current_score

    # Compute key factor variations
    factor_changes = []
    for factor_key in ["payment_reliability", "income_stability", "savings_discipline", "transaction_consistency", "digital_activity"]:
        base_f = baseline_pred["factor_ratings"].get(factor_key, {})
        sim_f = sim_pred["factor_ratings"].get(factor_key, {})
        delta_val = sim_f.get("score", 0) - base_f.get("score", 0)
        factor_changes.append({
            "factor": factor_key,
            "name": base_f.get("name", factor_key),
            "baseline_score": base_f.get("score", 0),
            "simulated_score": sim_f.get("score", 0),
            "delta": round(delta_val, 1),
            "status": sim_f.get("status", "Strong")
        })

    return {
        "current_score": current_score,
        "current_band": current_band,
        "simulated_score": simulated_score,
        "simulated_band": simulated_band,
        "score_delta": score_delta,
        "simulated_repayment_probability": sim_pred["repayment_probability"],
        "factor_changes": factor_changes,
        "disclaimer": "Model Simulation — Not a Guaranteed Future Score"
    }
