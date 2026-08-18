import React, { useState } from 'react';
import type { ShapExplanation } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ShapWaterfallProps {
  explanation: ShapExplanation;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({ explanation }) => {
  const [activeTab, setActiveTab] = useState<'waterfall' | 'positive' | 'negative' | 'advice'>('waterfall');

  const maxAbsShap = Math.max(
    ...explanation.top_contributions.map((c) => Math.abs(c.shap_value)),
    0.1
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-primary">
            <Sparkles className="w-5 h-5 text-accent-dark" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">Explainable AI (TreeSHAP Attribution)</h3>
            <p className="text-xs text-slate-500">
              Mathematical feature attribution showing exactly how each factor moved your score from the population baseline ({explanation.baseline_score}).
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('waterfall')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'waterfall'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            All Factors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('positive')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'positive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Positive (+{explanation.positive_factors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('negative')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'negative'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Negative ({explanation.negative_factors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advice')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'advice'
                ? 'bg-primary text-accent shadow-sm'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            AI Action Plan
          </button>
        </div>
      </div>

      {/* Narrative Headline */}
      {explanation.narrative && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-2">
          <div className="flex items-start space-x-2.5">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Algorithmic Summary</h4>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{explanation.narrative.headline}</p>
              <div className="mt-2 text-xs space-y-1 text-slate-600">
                {explanation.narrative.positive_summary && (
                  <p className="flex items-center space-x-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>Strengths:</strong> {explanation.narrative.positive_summary}</span>
                  </p>
                )}
                {explanation.narrative.negative_summary && (
                  <p className="flex items-center space-x-1.5 text-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>Opportunities:</strong> {explanation.narrative.negative_summary}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHAP Waterfall / Feature List */}
      {(activeTab === 'waterfall' || activeTab === 'positive' || activeTab === 'negative') && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
            <span>Behavioral Factor & Observed Value</span>
            <span>Estimated Point Impact</span>
          </div>

          <div className="space-y-2.5">
            {(activeTab === 'waterfall'
              ? explanation.top_contributions
              : activeTab === 'positive'
              ? explanation.positive_factors
              : explanation.negative_factors
            ).map((contrib, idx) => {
              const isPos = contrib.direction === 'positive';
              const barWidthPct = Math.min(100, (Math.abs(contrib.shap_value) / maxAbsShap) * 100);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isPos ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isPos ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{contrib.label}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Observed Value: <strong>{String(contrib.value)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-md ${
                          isPos
                            ? 'bg-emerald-100/80 text-emerald-800'
                            : 'bg-rose-100/80 text-rose-800'
                        }`}
                      >
                        {contrib.point_impact > 0 ? `+${contrib.point_impact}` : contrib.point_impact} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        SHAP: {contrib.shap_value.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Impact Bar */}
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isPos ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'advice' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-1">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Personalized Growth Roadmap</h4>
            <p className="text-xs text-slate-600">
              Actions calculated to give the highest positive SHAP uplift for this exact financial profile:
            </p>
          </div>

          <div className="space-y-2.5">
            {explanation.narrative.actionable_advice.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-start space-x-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
