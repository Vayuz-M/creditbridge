# CreditBridge

> **Bridging the Credit Gap with Alternative Financial Intelligence & Explainable AI**

CreditBridge is an alternative credit scoring platform designed for gig workers, informal merchants, and individuals without traditional credit bureau histories. It utilizes machine learning (XGBoost, LightGBM, Random Forest) to assess creditworthiness based on cash flow predictability, utility bill discipline, and digital payment consistency — paired with TreeSHAP mathematical explainability, algorithmic fairness auditing, and an interactive counterfactual simulator.

---

## 🌟 Key Capabilities

1. **Alternative Credit Scoring (300–850)**:
   - Evaluates **5 Behavioral Pillars**:
     - **Payment Reliability (35%)**: On-time utility & mobile recharge payments.
     - **Income Stability (25%)**: Regularity and variance of earnings.
     - **Savings Discipline (15%)**: Monthly retention buffer and savings ratio.
     - **Transaction Consistency (15%)**: Variance and density of transactions.
     - **Digital Footprint (10%)**: Digital account longevity and activity.
2. **Explainable AI (TreeSHAP Feature Attribution)**:
   - Visual breakdown of exact positive and negative score drivers relative to the baseline population.
   - Plain-English algorithmic narrative and personalized credit score uplift roadmaps.
3. **Interactive "What-If" Counterfactual Simulator**:
   - Real-time slider playground calculating marginal score deltas (+pts) for targeted habit improvements.
4. **Responsible AI & Fairness Auditing**:
   - Continuous auditing for **Demographic Parity Difference (DPD)** and **Equal Opportunity Difference (EOD)** across Gender, Age Groups, and Occupation cohorts.
5. **Admin Governance & ML Model Arena**:
   - Side-by-side benchmark comparison of XGBoost, LightGBM, and Random Forest on held-out test data.
   - 1-click dynamic production model switching and synthetic dataset generation controls.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: FastAPI (Python 3.10), SQLAlchemy, Pydantic, Scikit-learn, XGBoost, LightGBM, SHAP, Pytest.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd "Iqoo Hackathon"

# Launch frontend and backend with Docker Compose
docker compose up --build -d
```
- **Web Application**: `http://localhost:5173/` or `http://localhost/`
- **Backend API Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python init_system.py
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification

Run the automated test suite and commercial deployment readiness audit:
```bash
cd backend
python run_audit.py
```

---

## 🔑 Demo Logins (1-Click)

Visit `/login` to use the pre-configured 1-click credentials:
- **Demo User**: `demo.user@creditbridge.ai` / `CreditBridge2026!`
- **Demo Admin**: `admin@creditbridge.ai` / `CreditBridge2026!`

---

## 📄 License
MIT License
