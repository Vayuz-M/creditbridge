"""
CreditBridge Synthetic Dataset Generator
Generates realistic alternative financial profiles with latent risk-based repayment outcomes.
Documented: Target is synthetically generated and not based on proprietary credit bureau data.
"""

import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, Tuple


class SyntheticDataGenerator:
    def __init__(self, random_seed: int = 42):
        self.random_seed = random_seed
        np.random.seed(self.random_seed)

    def generate_dataset(self, n_samples: int = 15000) -> pd.DataFrame:
        """
        Generates n_samples synthetic financial profiles with realistic alternative signals.
        """
        np.random.seed(self.random_seed)

        # 1. Audit / Demographic Attributes (for Responsible AI Fairness Evaluation)
        age_groups = np.random.choice(
            ["<25", "25-34", "35-49", "50+"],
            size=n_samples,
            p=[0.25, 0.40, 0.25, 0.10]
        )
        genders = np.random.choice(
            ["Female", "Male", "Non-Binary/Other"],
            size=n_samples,
            p=[0.42, 0.54, 0.04]
        )
        occupations = np.random.choice(
            [
                "Gig Worker / Delivery",
                "Freelancer / Creator",
                "Informal MSME / Shopkeeper",
                "Salaried Entry-level",
                "Student / First-time Earner"
            ],
            size=n_samples,
            p=[0.28, 0.22, 0.20, 0.18, 0.12]
        )

        # 2. Income Features
        # Base income sampled based on occupation with lognormal variance
        base_incomes = []
        for occ in occupations:
            if occ == "Student / First-time Earner":
                inc = np.random.lognormal(mean=9.5, sigma=0.35)  # ~15,000 - 30,000
            elif occ == "Gig Worker / Delivery":
                inc = np.random.lognormal(mean=10.2, sigma=0.30) # ~25,000 - 45,000
            elif occ == "Freelancer / Creator":
                inc = np.random.lognormal(mean=10.8, sigma=0.45) # ~40,000 - 80,000
            elif occ == "Informal MSME / Shopkeeper":
                inc = np.random.lognormal(mean=10.9, sigma=0.40) # ~45,000 - 90,000
            else: # Salaried Entry-level
                inc = np.random.lognormal(mean=10.6, sigma=0.35) # ~35,000 - 65,000
            base_incomes.append(np.clip(inc, 12000, 250000))

        monthly_income = np.array(base_incomes)
        
        income_groups = []
        for inc in monthly_income:
            if inc < 30000:
                income_groups.append("Low Income (<30k)")
            elif inc <= 80000:
                income_groups.append("Middle Income (30k-80k)")
            else:
                income_groups.append("Upper Middle (>80k)")

        # Income variability & regularity
        # Gig workers and freelancers have higher income variability
        variability_bias = np.array([
            0.45 if occ in ["Gig Worker / Delivery", "Freelancer / Creator"] 
            else 0.35 if occ == "Informal MSME / Shopkeeper" 
            else 0.18 for occ in occupations
        ])
        income_variability = np.clip(
            np.random.beta(a=2, b=5, size=n_samples) + variability_bias * 0.4,
            0.05, 0.95
        )
        income_regularity = np.clip(
            1.0 - (income_variability * 0.85 + np.random.normal(0, 0.08, n_samples)),
            0.05, 0.98
        )
        income_sources = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.55, 0.30, 0.12, 0.03])

        # 3. Transaction Features
        monthly_transaction_count = np.clip(
            np.random.poisson(lam=45, size=n_samples) + (monthly_income / 3500).astype(int),
            5, 180
        )
        average_transaction_value = np.clip(
            (monthly_income * 0.45) / monthly_transaction_count + np.random.normal(0, 150, n_samples),
            150, 25000
        )
        transaction_consistency = np.clip(
            np.random.beta(a=5, b=2, size=n_samples) - (income_variability * 0.25),
            0.10, 0.98
        )
        digital_payment_ratio = np.clip(
            np.random.beta(a=6, b=2, size=n_samples),
            0.20, 0.99
        )

        # 4. Utility Bills & Payment Discipline
        # Behavioral on-time habits
        discipline_latent = (
            income_regularity * 0.35 +
            transaction_consistency * 0.25 +
            (1.0 - income_variability) * 0.25 +
            np.random.normal(0, 0.15, n_samples)
        )
        discipline_score = np.clip((discipline_latent - np.min(discipline_latent)) / (np.max(discipline_latent) - np.min(discipline_latent)), 0.05, 0.98)

        electricity_payment_consistency = np.clip(
            discipline_score * 0.85 + np.random.uniform(0.05, 0.15, n_samples),
            0.10, 1.0
        )
        mobile_payment_consistency = np.clip(
            discipline_score * 0.90 + np.random.uniform(0.02, 0.12, n_samples),
            0.15, 1.0
        )
        rent_payment_consistency = np.clip(
            discipline_score * 0.80 + np.random.uniform(0.05, 0.20, n_samples),
            0.10, 1.0
        )
        
        on_time_payment_ratio = np.clip(
            (electricity_payment_consistency + mobile_payment_consistency + rent_payment_consistency) / 3.0,
            0.10, 1.0
        )
        average_payment_delay = np.clip(
            (1.0 - on_time_payment_ratio) * 35.0 + np.random.exponential(scale=2.5, size=n_samples),
            0.0, 45.0
        )

        # 5. Savings Behavior
        savings_ratio_base = np.clip(
            (discipline_score * 0.28) + (1.0 - income_variability) * 0.12 + np.random.normal(0, 0.05, n_samples),
            0.02, 0.55
        )
        monthly_savings = monthly_income * savings_ratio_base
        savings_ratio = monthly_savings / monthly_income

        # 6. Digital Footprint & Activity Age
        upi_activity_months = np.clip(
            np.random.gamma(shape=3.5, scale=7.0, size=n_samples).astype(int),
            2, 72
        )
        digital_activity_months = np.clip(
            upi_activity_months + np.random.randint(2, 18, size=n_samples),
            4, 84
        )
        transaction_history_months = np.clip(
            upi_activity_months - np.random.randint(0, 6, size=n_samples),
            1, 60
        )

        # 7. Latent Risk Function & Synthetic Outcome Generation
        # Multi-factor latent creditworthiness equation (scientifically modeled, not a simple linear score)
        latent_credit_score = (
            + 2.8 * on_time_payment_ratio
            + 2.2 * savings_ratio
            + 1.8 * income_regularity
            + 1.5 * transaction_consistency
            + 1.2 * (digital_activity_months / 84.0)
            + 0.9 * digital_payment_ratio
            - 2.4 * income_variability
            - 2.2 * (average_payment_delay / 45.0)
            - 0.5 * (income_sources == 1).astype(float) * income_variability
        )

        # Add controlled non-linear noise representing unobserved economic shocks
        controlled_noise = np.random.normal(loc=0.0, scale=0.45, size=n_samples)
        latent_z = latent_credit_score + controlled_noise - 1.8

        # Sigmoid to calculate realistic repayment probability
        repayment_probability = 1.0 / (1.0 + np.exp(-latent_z))
        
        # Binary target outcome (1 = positive repayment, 0 = negative outcome)
        repayment_outcome = (np.random.uniform(0, 1, size=n_samples) < repayment_probability).astype(int)

        # Construct full DataFrame
        df = pd.DataFrame({
            # Predictive Alternative Financial Features
            "monthly_income": np.round(monthly_income, 2),
            "income_variability": np.round(income_variability, 4),
            "income_regularity": np.round(income_regularity, 4),
            "income_sources": income_sources,
            "monthly_transaction_count": monthly_transaction_count,
            "average_transaction_value": np.round(average_transaction_value, 2),
            "transaction_consistency": np.round(transaction_consistency, 4),
            "digital_payment_ratio": np.round(digital_payment_ratio, 4),
            "electricity_payment_consistency": np.round(electricity_payment_consistency, 4),
            "mobile_payment_consistency": np.round(mobile_payment_consistency, 4),
            "rent_payment_consistency": np.round(rent_payment_consistency, 4),
            "average_payment_delay": np.round(average_payment_delay, 2),
            "on_time_payment_ratio": np.round(on_time_payment_ratio, 4),
            "monthly_savings": np.round(monthly_savings, 2),
            "savings_ratio": np.round(savings_ratio, 4),
            "upi_activity_months": upi_activity_months,
            "digital_activity_months": digital_activity_months,
            "transaction_history_months": transaction_history_months,

            # Audit / Demographic Attributes (Fairness Evaluation Only)
            "age_group": age_groups,
            "gender": genders,
            "income_group": income_groups,
            "occupation_category": occupations,

            # Ground-truth targets
            "repayment_probability": np.round(repayment_probability, 4),
            "repayment_outcome": repayment_outcome
        })

        return df


def get_default_sample_personas() -> Dict[str, Dict[str, Any]]:
    """
    Returns rich, authentic sample personas for quick UI evaluation.
    """
    return {
        "gig_worker": {
            "name": "Arjun Sharma (Gig Delivery Worker)",
            "monthly_income": 32000.0,
            "income_variability": 0.38,
            "income_regularity": 0.72,
            "income_sources": 2,
            "monthly_transaction_count": 68,
            "average_transaction_value": 340.0,
            "transaction_consistency": 0.85,
            "digital_payment_ratio": 0.92,
            "electricity_payment_consistency": 0.88,
            "mobile_payment_consistency": 0.96,
            "rent_payment_consistency": 0.82,
            "average_payment_delay": 2.5,
            "on_time_payment_ratio": 0.89,
            "monthly_savings": 6500.0,
            "savings_ratio": 0.203,
            "upi_activity_months": 28,
            "digital_activity_months": 36,
            "transaction_history_months": 26,
            "age_group": "25-34",
            "gender": "Male",
            "occupation_category": "Gig Worker / Delivery"
        },
        "freelancer": {
            "name": "Priya Nair (Freelance UI Designer)",
            "monthly_income": 65000.0,
            "income_variability": 0.44,
            "income_regularity": 0.65,
            "income_sources": 3,
            "monthly_transaction_count": 52,
            "average_transaction_value": 780.0,
            "transaction_consistency": 0.78,
            "digital_payment_ratio": 0.95,
            "electricity_payment_consistency": 0.95,
            "mobile_payment_consistency": 0.98,
            "rent_payment_consistency": 0.92,
            "average_payment_delay": 1.2,
            "on_time_payment_ratio": 0.95,
            "monthly_savings": 18000.0,
            "savings_ratio": 0.277,
            "upi_activity_months": 38,
            "digital_activity_months": 48,
            "transaction_history_months": 34,
            "age_group": "25-34",
            "gender": "Female",
            "occupation_category": "Freelancer / Creator"
        },
        "msme_shopkeeper": {
            "name": "Ramesh Patel (Kirana Store Owner)",
            "monthly_income": 58000.0,
            "income_variability": 0.22,
            "income_regularity": 0.88,
            "income_sources": 1,
            "monthly_transaction_count": 115,
            "average_transaction_value": 420.0,
            "transaction_consistency": 0.92,
            "digital_payment_ratio": 0.84,
            "electricity_payment_consistency": 0.92,
            "mobile_payment_consistency": 0.90,
            "rent_payment_consistency": 0.95,
            "average_payment_delay": 1.8,
            "on_time_payment_ratio": 0.92,
            "monthly_savings": 14500.0,
            "savings_ratio": 0.250,
            "upi_activity_months": 42,
            "digital_activity_months": 54,
            "transaction_history_months": 40,
            "age_group": "35-49",
            "gender": "Male",
            "occupation_category": "Informal MSME / Shopkeeper"
        },
        "student_fresher": {
            "name": "Ananya Roy (Entry-level Analyst / Fresher)",
            "monthly_income": 26000.0,
            "income_variability": 0.15,
            "income_regularity": 0.92,
            "income_sources": 1,
            "monthly_transaction_count": 38,
            "average_transaction_value": 310.0,
            "transaction_consistency": 0.70,
            "digital_payment_ratio": 0.98,
            "electricity_payment_consistency": 0.78,
            "mobile_payment_consistency": 0.95,
            "rent_payment_consistency": 0.80,
            "average_payment_delay": 4.0,
            "on_time_payment_ratio": 0.84,
            "monthly_savings": 4000.0,
            "savings_ratio": 0.154,
            "upi_activity_months": 14,
            "digital_activity_months": 22,
            "transaction_history_months": 12,
            "age_group": "<25",
            "gender": "Female",
            "occupation_category": "Student / First-time Earner"
        }
    }
