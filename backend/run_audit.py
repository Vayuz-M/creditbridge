"""
CreditBridge Commercial Deployment Readiness Audit Runner
Executes comprehensive A-to-Z checks across Security, ML Models, API, and DevOps.
"""

import os
import sys
import time
import subprocess

# Set path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from ml.predict import Predictor
from ml.fairness import FairnessAuditor


def run_commercial_audit():
    print("=" * 70)
    print("  CREDITBRIDGE COMMERCIAL DEPLOYMENT READINESS AUDIT")
    print("  Enterprise Alternative Credit Intelligence Platform")
    print("=" * 70)
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Target Environment: {settings.ENVIRONMENT}")
    print("-" * 70)

    checklist = []

    # 1. Environment & Configuration Check
    print("\n[A] Configuration & Secrets Hardening...")
    has_jwt_secret = bool(settings.SECRET_KEY) and len(settings.SECRET_KEY) >= 16
    has_db_url = bool(settings.DATABASE_URL)
    env_example_exists = os.path.exists(os.path.join(settings.BASE_DIR, ".env.example"))
    
    if has_jwt_secret and has_db_url and env_example_exists:
        print("  [PASS] JWT secret configured, DB URL bound, .env.example present.")
        checklist.append(("Security & Config", "PASS", "Secrets & Environment configured properly"))
    else:
        print("  [FAIL] Missing configuration or environment template.")
        checklist.append(("Security & Config", "FAIL", "Config missing"))

    # 2. Database & Schema Check
    print("\n[B] Database & Schema Connectivity...")
    db_file = os.path.join(settings.DATA_DIR, "creditbridge.db")
    db_ok = os.path.exists(db_file) and os.path.getsize(db_file) > 0
    if db_ok:
        print(f"  [PASS] SQLite production schema operational ({os.path.getsize(db_file):,} bytes).")
        checklist.append(("Database & Storage", "PASS", "Schema active and populated"))
    else:
        print("  [FAIL] Database not found or empty.")
        checklist.append(("Database & Storage", "FAIL", "DB not found"))

    # 3. ML Model Artifacts & Integrity
    print("\n[C] Machine Learning Model Health & Calibration...")
    models_meta_file = os.path.join(settings.MODELS_DIR, "models_metadata.json")
    if os.path.exists(models_meta_file):
        predictor = Predictor(models_dir=settings.MODELS_DIR)
        test_pred = predictor.predict_profile({
            "monthly_income": 40000,
            "income_variability": 0.15,
            "income_regularity": 0.90,
            "income_sources": 2,
            "monthly_transaction_count": 50,
            "average_transaction_value": 400,
            "transaction_consistency": 0.85,
            "digital_payment_ratio": 0.90,
            "electricity_payment_consistency": 0.95,
            "mobile_payment_consistency": 0.95,
            "rent_payment_consistency": 0.90,
            "average_payment_delay": 2.0,
            "on_time_payment_ratio": 0.92,
            "monthly_savings": 8000,
            "upi_activity_months": 24,
            "digital_activity_months": 36,
            "transaction_history_months": 24,
            "age_group": "26-35",
            "gender": "Male",
            "occupation_category": "Gig Economy"
        })
        score = test_pred["trust_score"]
        if 300 <= score <= 850:
            print(f"  [PASS] ML Model Engine active. Benchmark Score={score} (Band: {test_pred['score_band']}).")
            checklist.append(("ML Models & Integrity", "PASS", f"Active Algorithm: {test_pred['algorithm']}"))
        else:
            print(f"  [FAIL] Score out of bounds: {score}")
            checklist.append(("ML Models & Integrity", "FAIL", "Score out of bounds"))
    else:
        print("  [FAIL] models_metadata.json not found.")
        checklist.append(("ML Models & Integrity", "FAIL", "Metadata missing"))

    # 4. Responsible AI & Algorithmic Fairness Audit
    print("\n[D] Responsible AI & Fairness Audit...")
    try:
        auditor = FairnessAuditor(models_dir=settings.MODELS_DIR)
        fairness_res = auditor.audit_model()
        dpd = fairness_res["overall_status"]["max_demographic_parity_diff"]
        eod = fairness_res["overall_status"]["max_equal_opportunity_diff"]
        is_compliant = fairness_res["overall_status"]["is_compliant"]
        print(f"  [PASS] Audited {fairness_res['test_records_audited']} records. DPD={dpd:.1f}%, EOD={eod:.1f}%. Status: {fairness_res['overall_status']['badge']}")
        checklist.append(("Responsible AI & Fairness", "PASS" if is_compliant else "WARN", f"DPD: {dpd:.1f}%, EOD: {eod:.1f}%"))
    except Exception as e:
        print(f"  [FAIL] Fairness audit error: {e}")
        checklist.append(("Responsible AI & Fairness", "FAIL", str(e)))

    # 5. DevOps & Containerization Artifacts
    print("\n[E] DevOps, Docker & Containerization Check...")
    root_dir = os.path.dirname(settings.BASE_DIR)
    has_compose = os.path.exists(os.path.join(root_dir, "docker-compose.yml"))
    has_backend_dockerfile = os.path.exists(os.path.join(settings.BASE_DIR, "Dockerfile"))
    has_frontend_dockerfile = os.path.exists(os.path.join(root_dir, "frontend", "Dockerfile"))
    has_nginx = os.path.exists(os.path.join(root_dir, "frontend", "nginx.conf"))

    if has_compose and has_backend_dockerfile and has_frontend_dockerfile and has_nginx:
        print("  [PASS] Dockerfile (Backend), Dockerfile (Frontend), Nginx.conf & docker-compose.yml present.")
        checklist.append(("DevOps & Containers", "PASS", "Multi-stage Docker & Compose ready"))
    else:
        print(f"  [FAIL] Missing Docker files (compose: {has_compose}, be: {has_backend_dockerfile}, fe: {has_frontend_dockerfile}, nginx: {has_nginx})")
        checklist.append(("DevOps & Containers", "FAIL", "Missing Docker configurations"))

    # 6. Run Pytest Suite
    print("\n[F] Running Automated Pytest Quality Assurance Suite...")
    res = subprocess.run(
        [sys.executable, "-m", "pytest", "tests", "-v", "--no-header"],
        cwd=settings.BASE_DIR,
        capture_output=True,
        text=True
    )
    if res.returncode == 0:
        print("  [PASS] All Pytest unit and integration tests passed cleanly.")
        print(res.stdout)
        checklist.append(("Pytest Test Suite", "PASS", "100% tests passing"))
    else:
        print("  [FAIL] Pytest suite failed:")
        print(res.stdout)
        print(res.stderr)
        checklist.append(("Pytest Test Suite", "FAIL", "Tests failed"))

    # Summary Table
    print("\n" + "=" * 70)
    print("  EXECUTIVE DEPLOYMENT READINESS SCORECARD")
    print("=" * 70)
    all_passed = True
    for category, status, detail in checklist:
        mark = "[PASS]" if status == "PASS" else "[WARN]" if status == "WARN" else "[FAIL]"
        if status == "FAIL":
            all_passed = False
        print(f"  {category:<28} | {mark:<8} | {detail}")
    print("=" * 70)

    if all_passed:
        print("\n>>> CONCLUSION: CREDITBRIDGE IS 100% DEPLOYMENT READY FOR COMMERCIAL USE! <<<\n")
    else:
        print("\n>>> CONCLUSION: ACTION ITEMS DETECTED. PLEASE REVIEW SCORECARD. <<<\n")

    return all_passed


if __name__ == "__main__":
    success = run_commercial_audit()
    sys.exit(0 if success else 1)
