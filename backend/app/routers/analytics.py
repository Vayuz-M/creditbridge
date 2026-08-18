"""
CreditBridge Analytics, SHAP Explainability & Responsible AI Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ..database import get_db
from ..models.models import User, Assessment
from ..auth.auth import get_current_user
from ml.explain import ShapExplainer
from ml.fairness import FairnessAuditor

router = APIRouter(prefix="/analytics", tags=["Analytics & Explainability"])

shap_explainer = ShapExplainer()
fairness_auditor = FairnessAuditor()


@router.get("/score/{assessment_id}")
def get_score_analytics(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns granular score factor strengths and percentile approximations."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if assessment.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized.")

    # Calculate national / peer percentile approximation
    score = assessment.trust_score
    if score >= 800:
        percentile = 92
    elif score >= 740:
        percentile = 78
    elif score >= 670:
        percentile = 62
    elif score >= 580:
        percentile = 44
    else:
        percentile = 18

    return {
        "assessment_id": assessment.id,
        "trust_score": assessment.trust_score,
        "score_band": assessment.score_band,
        "band_tier": assessment.band_tier,
        "band_color": assessment.band_color,
        "repayment_probability": assessment.repayment_probability,
        "risk_probability": assessment.risk_probability,
        "estimated_percentile": percentile,
        "factor_ratings": assessment.factor_ratings,
        "created_at": assessment.created_at
    }


@router.get("/explanation/{assessment_id}")
def get_assessment_explanation(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns local TreeSHAP feature attributions and plain-English translations."""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if assessment.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized.")

    if assessment.shap_explanation:
        return assessment.shap_explanation

    # Re-calculate SHAP if not stored
    if assessment.raw_features:
        explanation = shap_explainer.explain_profile(assessment.raw_features, assessment.trust_score)
        assessment.shap_explanation = explanation
        db.commit()
        return explanation

    return {
        "trust_score": assessment.trust_score,
        "baseline_score": 540,
        "top_contributions": [],
        "positive_factors": [],
        "negative_factors": [],
        "narrative": {
            "headline": f"Why did you receive a Trust Score of {assessment.trust_score}?",
            "positive_summary": "Strong digital payment and savings consistency.",
            "negative_summary": "No critical risk flags detected.",
            "actionable_advice": ["Maintain consistent on-time bill payments."]
        }
    }


@router.get("/global-shap")
def get_global_shap_importance(top_n: int = 10):
    """Returns population-level global SHAP feature importances."""
    return {
        "methodology": "TreeSHAP Mean Absolute Attribution (|SHAP|)",
        "features": shap_explainer.get_global_importance(top_n=top_n)
    }


@router.get("/fairness")
def get_fairness_report():
    """Returns empirical group fairness audit across demographic slices."""
    return fairness_auditor.evaluate_fairness()
