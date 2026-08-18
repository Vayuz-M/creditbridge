import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import type { FairnessReport } from '../types';
import { 
  Scale, 
  CheckCircle2, 
  Lock, 
  Eye, 
  FileCheck,
  Users
} from 'lucide-react';

export const ResponsibleAiPage: React.FC = () => {
  const [report, setReport] = useState<FairnessReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSlice, setActiveSlice] = useState<string>('gender');

  useEffect(() => {
    const fetchFairness = async () => {
      setLoading(true);
      try {
        const data = await analyticsApi.getFairnessReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load fairness audit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFairness();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Algorithmic Bias Audit & Model Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Responsible & Fair AI Framework
        </h1>
        <p className="text-sm text-slate-600">
          Continuous algorithmic auditing across Demographic Parity, Equal Opportunity, and True Positive Parity to ensure zero systemic bias against protected groups.
        </p>
      </div>

      {/* Audit Banner */}
      {loading ? (
        <div className="min-h-[25vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Status Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-light to-secondary text-white shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  Audit Status: {report.overall_status.badge}
                </span>
                <span className="text-xs text-slate-300">
                  {report.test_records_audited.toLocaleString()} test records audited
                </span>
              </div>
              <h2 className="text-xl font-bold">{report.overall_status.text}</h2>
              <p className="text-xs text-slate-200 max-w-2xl">
                {report.overall_status.scientific_disclaimer}
              </p>
            </div>

            <div className="shrink-0 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <span className="text-[10px] text-slate-300 block">Max Demo. Parity Diff</span>
                <span className="text-lg font-black text-accent font-mono">
                  {(report.overall_status.max_demographic_parity_diff * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-emerald-300 block">&lt; 10% Threshold</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <span className="text-[10px] text-slate-300 block">Max Eq. Opportunity Diff</span>
                <span className="text-lg font-black text-accent font-mono">
                  {(report.overall_status.max_equal_opportunity_diff * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-emerald-300 block">&lt; 10% Threshold</span>
              </div>
            </div>
          </div>

          {/* Slices View Selector */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {Object.keys(report.slices).map((sliceKey) => {
              const slice = report.slices[sliceKey];
              const isSelected = activeSlice === sliceKey;
              return (
                <button
                  key={sliceKey}
                  type="button"
                  onClick={() => setActiveSlice(sliceKey)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{slice.slice_name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Slice Table & Metrics */}
          {report.slices[activeSlice] && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {report.slices[activeSlice].slice_name} Audit Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing approval selection rates and true positive rates across sub-cohorts
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="p-1.5 rounded-lg bg-slate-100 font-mono text-slate-700">
                    DPD: <strong>{(report.slices[activeSlice].demographic_parity_difference * 100).toFixed(1)}%</strong>
                  </span>
                  <span className="p-1.5 rounded-lg bg-slate-100 font-mono text-slate-700">
                    EOD: <strong>{(report.slices[activeSlice].equal_opportunity_difference * 100).toFixed(1)}%</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compliant</span>
                  </span>
                </div>
              </div>

              {/* Group Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Sub-Cohort Group</th>
                      <th className="px-4 py-3">Sample Count</th>
                      <th className="px-4 py-3">Average Trust Score</th>
                      <th className="px-4 py-3">Selection Rate (Approval)</th>
                      <th className="px-4 py-3">True Positive Rate (TPR)</th>
                      <th className="px-4 py-3">False Positive Rate (FPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.slices[activeSlice].groups.map((group, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {group.group_name}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono">
                          {group.sample_count}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                          {Math.round(group.average_score)}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {(group.selection_rate * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">
                          {(group.tpr * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500">
                          {(group.fpr * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Core Responsible AI Principles */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">CreditBridge Core Governance Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">1. Algorithmic Fairness</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Models are audited using Demographic Parity and Equalized Odds to ensure approval criteria do not disadvantage based on gender, age, or region.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 w-fit">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">2. Right to Explanation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every score comes with exact point-level TreeSHAP feature attributions, explaining what raised or lowered the rating without black boxes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 w-fit">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">3. Actionable Recourse</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Through the What-If Simulator, borrowers receive clear steps to reach prime status rather than unconditional rejection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">4. Privacy by Design</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only consented cash flow metadata (bill regularity, UPI velocity) is processed. Raw transaction text or contacts are never stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
