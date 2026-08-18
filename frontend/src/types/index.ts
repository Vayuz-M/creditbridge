export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
}

export interface FactorRating {
  name: string;
  score: number;
  status: 'Exceptional' | 'Strong' | 'Moderate' | 'Needs Improvement';
  weight: string;
  description: string;
}

export interface ShapContribution {
  feature: string;
  label: string;
  value: string | number;
  shap_value: number;
  point_impact: number;
  direction: 'positive' | 'negative';
}

export interface ShapNarrative {
  headline: string;
  positive_summary: string;
  negative_summary: string;
  actionable_advice: string[];
}

export interface ShapExplanation {
  trust_score: number;
  baseline_score: number;
  top_contributions: ShapContribution[];
  positive_factors: ShapContribution[];
  negative_factors: ShapContribution[];
  narrative: ShapNarrative;
  all_features_shap: ShapContribution[];
}

export interface Assessment {
  id: number;
  user_id: number;
  trust_score: number;
  score_band: string;
  band_tier: string;
  band_color: string;
  repayment_probability: number;
  risk_probability: number;
  model_version: string;
  algorithm: string;
  factor_ratings: {
    payment_reliability: FactorRating;
    income_stability: FactorRating;
    savings_discipline: FactorRating;
    transaction_consistency: FactorRating;
    digital_activity: FactorRating;
  };
  shap_explanation?: ShapExplanation;
  raw_features?: Record<string, number | string>;
  created_at: string;
}

export interface AssessmentSummary {
  id: number;
  trust_score: number;
  score_band: string;
  band_tier: string;
  band_color: string;
  repayment_probability: number;
  algorithm: string;
  created_at: string;
}

export interface SimulationResult {
  current_score: number;
  current_band: string;
  simulated_score: number;
  simulated_band: string;
  score_delta: number;
  simulated_repayment_probability: number;
  factor_changes: {
    factor: string;
    name: string;
    baseline_score: number;
    simulated_score: number;
    delta: number;
    status: string;
  }[];
  disclaimer: string;
}

export interface FairnessGroupMetric {
  group_name: string;
  sample_count: number;
  average_score: number;
  average_risk: number;
  selection_rate: number;
  tpr: number;
  fpr: number;
  fnr: number;
}

export interface FairnessSlice {
  slice_name: string;
  groups: FairnessGroupMetric[];
  demographic_parity_difference: number;
  equal_opportunity_difference: number;
  parity_threshold: number;
  equal_opportunity_threshold: number;
  is_compliant: boolean;
}

export interface FairnessReport {
  audit_timestamp: string;
  test_records_audited: number;
  threshold_score_used: number;
  overall_status: {
    badge: 'COMPLIANT' | 'REVIEW_REQUIRED';
    text: string;
    color: string;
    is_compliant: boolean;
    max_demographic_parity_diff: number;
    max_equal_opportunity_diff: number;
    scientific_disclaimer: string;
  };
  slices: Record<string, FairnessSlice>;
}

export interface ModelMetrics {
  roc_auc: number;
  pr_auc: number;
  precision: number;
  recall: number;
  f1: number;
  brier_score: number;
  confusion_matrix: number[][];
  sample_size: number;
}

export interface ModelDetail {
  algorithm: string;
  version: string;
  filename: string;
  training_date: string;
  metrics: ModelMetrics;
}

export interface ModelComparisonData {
  active_model: string;
  active_model_name: string;
  model_version: string;
  training_date: string;
  dataset_records: number;
  models: Record<string, ModelDetail>;
}

export interface DatasetStats {
  version: string;
  total_records: number;
  feature_count: number;
  missing_values: number;
  class_balance: {
    positive_repayment_pct: number;
    negative_outcome_pct: number;
  };
  income_median: number;
  savings_ratio_median: number;
  on_time_ratio_mean: number;
  file_size_mb: number;
}

export interface AdminDashboardData {
  metrics: {
    total_users: number;
    total_assessments: number;
    average_trust_score: number;
    active_model: string;
    system_status: string;
    responsible_ai_status: string;
  };
  score_distribution: { range: string; count: number }[];
  risk_distribution: { band: string; count: number }[];
}

export interface PersonaPreset {
  name: string;
  monthly_income: number;
  income_variability: number;
  income_regularity: number;
  income_sources: number;
  monthly_transaction_count: number;
  average_transaction_value: number;
  transaction_consistency: number;
  digital_payment_ratio: number;
  electricity_payment_consistency: number;
  mobile_payment_consistency: number;
  rent_payment_consistency: number;
  average_payment_delay: number;
  on_time_payment_ratio: number;
  monthly_savings: number;
  savings_ratio: number;
  upi_activity_months: number;
  digital_activity_months: number;
  transaction_history_months: number;
  age_group: string;
  gender: string;
  occupation_category: string;
}
