import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, assessmentApi } from '../services/api';
import type { PersonaPreset } from '../types';
import { 
  Sparkles, 
  Wallet, 
  Smartphone, 
  Zap, 
  PiggyBank, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  Car,
  Store,
  Palette,
  GraduationCap
} from 'lucide-react';

export const AssessPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [personas, setPersonas] = useState<Record<string, PersonaPreset>>({});
  const [selectedPersona, setSelectedPersona] = useState<string>('custom');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Income
    monthly_income: 32000,
    income_variability: 0.18,
    income_regularity: 0.88,
    income_sources: 2,

    // Step 2: Digital UPI
    monthly_transaction_count: 52,
    average_transaction_value: 380,
    transaction_consistency: 0.85,
    digital_payment_ratio: 0.90,
    upi_activity_months: 28,

    // Step 3: Utility & Reliability
    electricity_payment_consistency: 0.94,
    mobile_payment_consistency: 0.96,
    rent_payment_consistency: 0.90,
    average_payment_delay: 2,
    on_time_payment_ratio: 0.92,

    // Step 4: Savings & Demographics
    monthly_savings: 6500,
    savings_ratio: 0.20,
    digital_activity_months: 30,
    transaction_history_months: 24,
    age_group: '26-35',
    gender: 'Male',
    occupation_category: 'Gig Economy'
  });

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const data = await authApi.getSamplePersonas();
        setPersonas(data);
      } catch (err) {
        console.error('Could not fetch personas:', err);
      }
    };
    fetchPersonas();
  }, []);

  const handlePersonaSelect = (key: string) => {
    setSelectedPersona(key);
    if (key !== 'custom' && personas[key]) {
      const p = personas[key];
      setFormData({
        monthly_income: p.monthly_income,
        income_variability: p.income_variability,
        income_regularity: p.income_regularity,
        income_sources: p.income_sources,
        monthly_transaction_count: p.monthly_transaction_count,
        average_transaction_value: p.average_transaction_value,
        transaction_consistency: p.transaction_consistency,
        digital_payment_ratio: p.digital_payment_ratio,
        upi_activity_months: p.upi_activity_months,
        electricity_payment_consistency: p.electricity_payment_consistency,
        mobile_payment_consistency: p.mobile_payment_consistency,
        rent_payment_consistency: p.rent_payment_consistency,
        average_payment_delay: p.average_payment_delay,
        on_time_payment_ratio: p.on_time_payment_ratio,
        monthly_savings: p.monthly_savings,
        savings_ratio: p.savings_ratio,
        digital_activity_months: p.digital_activity_months,
        transaction_history_months: p.transaction_history_months,
        age_group: p.age_group,
        gender: p.gender,
        occupation_category: p.occupation_category
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await assessmentApi.createAssessment(formData);
      navigate('/why-this-score');
    } catch (err: any) {
      console.error('Assessment failed:', err);
      setError(err.response?.data?.detail || 'Failed to generate assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const personaIcons: Record<string, any> = {
    gig_worker: Car,
    street_vendor: Store,
    rural_artisan: Palette,
    first_time_professional: GraduationCap
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-accent-dark" />
          <span>Zero Bureau History Required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Alternative Credit Assessment
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Input everyday financial behavior to compute an explainable, fair CreditBridge Trust Score powered by TreeSHAP.
        </p>
      </div>

      {/* Quick Demo Persona Selector */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Fast Fill: Select a Verified Persona Profile</span>
          </span>
          <span className="text-[11px] text-slate-400">1-click populated fields</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(personas).map(([key, persona]) => {
            const Icon = personaIcons[key] || User;
            const isSelected = selectedPersona === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePersonaSelect(key)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-primary'}`} />
                  <span className="text-xs font-bold truncate">{persona.name.split(' (')[0]}</span>
                </div>
                <span className={`text-[10px] block truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {persona.occupation_category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center justify-between px-2">
        {[
          { num: 1, label: 'Income Stability', icon: Wallet },
          { num: 2, label: 'UPI & Digital', icon: Smartphone },
          { num: 3, label: 'Utility Discipline', icon: Zap },
          { num: 4, label: 'Savings & Profile', icon: PiggyBank }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <div key={s.num} className="flex flex-col items-center space-y-1">
              <button
                type="button"
                onClick={() => setStep(s.num)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isActive
                    ? 'bg-primary text-accent ring-4 ring-primary/10'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </button>
              <span className={`text-[11px] font-semibold hidden sm:block ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* STEP 1: Income Stability */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-primary">Pillar 1: Income Stability & Cash Flow Regularity</h3>
              <p className="text-xs text-slate-500">Measures earnings volume, regularity, and diversification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Monthly Net Income (₹)
                </label>
                <input
                  type="number"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={formData.monthly_income}
                  onChange={(e) => handleInputChange('monthly_income', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">E.g., average monthly earnings from all sources</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Active Income Streams / Sources
                </label>
                <select
                  value={formData.income_sources}
                  onChange={(e) => handleInputChange('income_sources', parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                >
                  <option value={1}>1 Primary Client / Platform</option>
                  <option value={2}>2 Diversified Sources</option>
                  <option value={3}>3 Multi-stream Freelance / Vendor</option>
                  <option value={4}>4+ Diverse Income Inflows</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Income Regularity Index: {(formData.income_regularity * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.40"
                  max="1.00"
                  step="0.05"
                  value={formData.income_regularity}
                  onChange={(e) => handleInputChange('income_regularity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Irregular / Seasonal</span>
                  <span>Steady Periodic Inflows</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Income Variability (Coefficient of Variation): {(formData.income_variability * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={formData.income_variability}
                  onChange={(e) => handleInputChange('income_variability', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Low Fluctuation (Stable)</span>
                  <span>High Volatility (Spiky)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Digital UPI Footprint */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-primary">Pillar 2: UPI & Digital Transaction Footprint</h3>
              <p className="text-xs text-slate-500">Evaluates active digital engagement, transaction density, and payment tenure.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Monthly UPI Transaction Count
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.monthly_transaction_count}
                  onChange={(e) => handleInputChange('monthly_transaction_count', parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Daily peer & merchant UPI interactions</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Average Transaction Value (₹)
                </label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  step="50"
                  value={formData.average_transaction_value}
                  onChange={(e) => handleInputChange('average_transaction_value', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Digital Payment Ratio: {(formData.digital_payment_ratio * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.30"
                  max="1.00"
                  step="0.05"
                  value={formData.digital_payment_ratio}
                  onChange={(e) => handleInputChange('digital_payment_ratio', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>30% Digital</span>
                  <span>100% Fully Digital</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  UPI & Digital History (Months)
                </label>
                <input
                  type="number"
                  min="3"
                  max="72"
                  value={formData.upi_activity_months}
                  onChange={(e) => handleInputChange('upi_activity_months', parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Utility & Bill Payment Discipline */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-primary">Pillar 3: Utility & Bill Payment Discipline</h3>
              <p className="text-xs text-slate-500">Highest-weighted predictor: on-time electricity, mobile, and rent settlements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  On-Time Payment Ratio: {(formData.on_time_payment_ratio * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.40"
                  max="1.00"
                  step="0.02"
                  value={formData.on_time_payment_ratio}
                  onChange={(e) => handleInputChange('on_time_payment_ratio', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>40% On-Time</span>
                  <span>100% Flawless</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Average Payment Delay (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.average_payment_delay}
                  onChange={(e) => handleInputChange('average_payment_delay', parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">0 = Paid on or before due date</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Electricity Bill Regularity: {(formData.electricity_payment_consistency * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.40"
                  max="1.00"
                  step="0.05"
                  value={formData.electricity_payment_consistency}
                  onChange={(e) => handleInputChange('electricity_payment_consistency', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile / Broadband Recharge Regularity: {(formData.mobile_payment_consistency * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.40"
                  max="1.00"
                  step="0.05"
                  value={formData.mobile_payment_consistency}
                  onChange={(e) => handleInputChange('mobile_payment_consistency', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Savings & Demographics */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-primary">Pillar 4 & 5: Savings Discipline & Demographics</h3>
              <p className="text-xs text-slate-500">Savings buffer analysis and fairness-audited demographic context.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Average Monthly Savings (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="500"
                  value={formData.monthly_savings}
                  onChange={(e) => handleInputChange('monthly_savings', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Savings-to-Income Ratio: {(formData.savings_ratio * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="0.50"
                  step="0.02"
                  value={formData.savings_ratio}
                  onChange={(e) => handleInputChange('savings_ratio', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Occupation Category
                </label>
                <select
                  value={formData.occupation_category}
                  onChange={(e) => handleInputChange('occupation_category', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="Gig Economy">Gig Economy (Delivery / Rideshare)</option>
                  <option value="Small Business">Small Merchant / Kirana Shop</option>
                  <option value="Freelancer">Digital Freelancer / Creator</option>
                  <option value="Artisan">Rural Artisan / Craftsman</option>
                  <option value="Salaried">Entry-level Salaried Professional</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Age Group</label>
                  <select
                    value={formData.age_group}
                    onChange={(e) => handleInputChange('age_group', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="18-25">18–25</option>
                    <option value="26-35">26–35</option>
                    <option value="36-50">36–50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary / Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-md hover:shadow-glow transition-all flex items-center space-x-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-lg hover:shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing TreeSHAP Score...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Generate Trust Score</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
