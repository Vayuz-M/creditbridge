import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import type { Assessment } from '../types';
import { ShapWaterfall } from '../components/ShapWaterfall';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { 
  Sparkles, 
  ArrowLeft, 
  Sliders, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

export const ExplainabilityPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        if (id) {
          const res = await assessmentApi.getById(parseInt(id, 10));
          setAssessment(res);
        } else {
          const res = await assessmentApi.getLatest();
          setAssessment(res);
        }
      } catch (err: any) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-accent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Generating TreeSHAP explainability decomposition...</p>
      </div>
    );
  }

  if (!assessment || !assessment.shap_explanation) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-primary">No Assessment Available</h2>
        <p className="text-slate-600 text-sm">Please generate your initial score to view detailed AI explanations.</p>
        <Link
          to="/assess"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md"
        >
          <span>Run Assessment Now</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
              Why This Score? (Explainable AI Engine)
            </h1>
            <p className="text-xs text-slate-500">
              Audit-ready transparent breakdown of every alternative cash-flow factor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/simulator"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Simulator</span>
          </Link>
          <Link
            to="/assess"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Re-Assess</span>
          </Link>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Gauge Snapshot (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Evaluated Score
            </span>
            <div className="flex items-center justify-between my-2">
              <span className="text-3xl font-extrabold text-primary">{assessment.trust_score}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {assessment.score_band}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Model: <strong className="text-slate-700">{assessment.algorithm}</strong> (v{assessment.model_version})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Baseline Population Score:</span>
              <span className="font-bold text-slate-700 font-mono">{assessment.shap_explanation.baseline_score}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Net Feature Shift:</span>
              <span
                className={`font-bold font-mono ${
                  assessment.trust_score >= assessment.shap_explanation.baseline_score
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {assessment.trust_score >= assessment.shap_explanation.baseline_score ? '+' : ''}
                {assessment.trust_score - assessment.shap_explanation.baseline_score} pts
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Repayment Probability:</span>
              <span className="font-bold text-slate-700 font-mono">
                {(assessment.repayment_probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-primary space-y-1">
            <span className="font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-dark" />
              <span>Right to Explanation</span>
            </span>
            <p className="text-[11px] text-slate-600">
              Under Responsible AI guidelines, you are entitled to knowing every variable impacting your credit assessment.
            </p>
          </div>
        </div>

        {/* Right: SHAP Waterfall Decomposition (8 cols) */}
        <div className="lg:col-span-8">
          <ShapWaterfall explanation={assessment.shap_explanation} />
        </div>
      </div>

      {/* Embedded What-If Simulator with current profile */}
      {assessment.raw_features && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-extrabold text-primary">Test Improvement Scenarios with This Profile</h2>
          </div>
          <WhatIfSimulator
            baselineProfile={assessment.raw_features}
            currentScore={assessment.trust_score}
          />
        </div>
      )}
    </div>
  );
};
