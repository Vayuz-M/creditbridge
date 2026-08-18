import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentApi } from '../services/api';
import type { Assessment, AssessmentSummary } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { FactorCards } from '../components/FactorCards';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Sliders, 
  History, 
  ShieldCheck, 
  Lightbulb,
  Calendar,
  Zap
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [latest, hist] = await Promise.allSettled([
          assessmentApi.getLatest(),
          assessmentApi.getHistory()
        ]);

        if (latest.status === 'fulfilled') {
          setLatestAssessment(latest.value);
        }
        if (hist.status === 'fulfilled') {
          setHistory(hist.value);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-accent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Retrieving your alternative credit profile...</p>
      </div>
    );
  }

  // If no assessments exist yet, display an onboarding CTA
  if (!latestAssessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">
          Welcome to CreditBridge, {user?.full_name || 'Borrower'}!
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
          You haven't generated an alternative credit assessment yet. Use your daily UPI payments, utility receipts, and income regularity to create an explainable Trust Score in less than 2 minutes.
        </p>
        <Link
          to="/assess"
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold shadow-lg hover:shadow-glow transition-all"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Generate Your First Trust Score</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-light to-secondary text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alternative Credit Intelligence Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
            Your Trust Score reflects real-world cash flow, utility discipline, and UPI behavior rather than traditional bureau history.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            to="/assess"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-primary text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-accent-dark" />
            <span>Run New Assessment</span>
          </Link>
          <Link
            to="/simulator"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <Sliders className="w-4 h-4 text-accent" />
            <span>What-If Simulator</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Score Gauge + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trust Score Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-primary tracking-tight">CreditBridge Trust Score</h2>
              <p className="text-xs text-slate-500">Calculated via {latestAssessment.algorithm}</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              v{latestAssessment.model_version}
            </span>
          </div>

          <ScoreGauge
            score={latestAssessment.trust_score}
            scoreBand={latestAssessment.score_band}
            bandTier={latestAssessment.band_tier}
            bandColor={latestAssessment.band_color}
            repaymentProbability={latestAssessment.repayment_probability}
            size="lg"
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Assessed: {new Date(latestAssessment.created_at).toLocaleDateString()}</span>
            </span>
            <Link
              to="/why-this-score"
              className="font-bold text-primary hover:text-primary-light flex items-center space-x-1 group"
            >
              <span>Explain this score</span>
              <ArrowRight className="w-3.5 h-3.5 text-accent-dark group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column: AI Explainer & High-Impact Drivers (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top SHAP Drivers Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-accent/10 text-primary">
                  <Sparkles className="w-5 h-5 text-accent-dark" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">AI Score Attribution Highlights</h3>
                  <p className="text-xs text-slate-500">Top positive and negative factors shaping your score</p>
                </div>
              </div>
              <Link
                to="/why-this-score"
                className="text-xs font-bold text-slate-600 hover:text-primary underline underline-offset-4"
              >
                Full Waterfall
              </Link>
            </div>

            {latestAssessment.shap_explanation ? (
              <div className="space-y-3">
                {/* Algorithmic Headline */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {latestAssessment.shap_explanation.narrative?.headline ||
                      'Your strong utility bill regularity and steady cash flow drive a high baseline score.'}
                  </p>
                </div>

                {/* Top 3 Impact Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {latestAssessment.shap_explanation.top_contributions.slice(0, 4).map((contrib, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-2xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">
                          {contrib.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Value: {String(contrib.value)}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded font-mono ${
                          contrib.direction === 'positive'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {contrib.point_impact > 0 ? `+${contrib.point_impact}` : contrib.point_impact} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Explanation data generating...</p>
            )}
          </div>

          {/* Action Recommendation Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-200/80 p-6 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Next Best Action for Score Uplift</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {latestAssessment.shap_explanation?.narrative?.actionable_advice?.[0] ||
                  'Maintaining utility bill regularity for another 3 months will increase your score by up to +25 points.'}
              </p>
            </div>
            <Link
              to="/simulator"
              className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
            >
              <span>Test in Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Pillars Section */}
      <FactorCards factors={latestAssessment.factor_ratings} />

      {/* History Snapshot Card */}
      {history.length > 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-primary">Score Evaluation Timeline</h3>
            </div>
            <Link to="/history" className="text-xs font-bold text-primary hover:underline">
              View All ({history.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/why-this-score`)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 cursor-pointer transition-all space-y-1"
              >
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.algorithm}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-slate-900">{item.trust_score}</span>
                  <span className="text-xs font-semibold text-emerald-600">{item.score_band}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
