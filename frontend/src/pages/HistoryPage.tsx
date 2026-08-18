import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import type { AssessmentSummary } from '../types';
import { 
  History as HistoryIcon, 
  TrendingUp, 
  Layers, 
  Clock, 
  ChevronRight
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await assessmentApi.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const highestScore = history.length ? Math.max(...history.map((h) => h.trust_score)) : 0;
  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.trust_score, 0) / history.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary mb-2">
            <Clock className="w-3.5 h-3.5 text-accent-dark" />
            <span>Audit Trail & Evolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Assessment History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your credit progression and review historical TreeSHAP explanations.
          </p>
        </div>

        <Link
          to="/assess"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
        >
          <Layers className="w-4 h-4 text-accent" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Assessments
            </span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {history.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Highest Score
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              {highestScore}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Score
            </span>
            <span className="text-2xl font-extrabold text-primary mt-1 block">
              {avgScore}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Latest Movement
            </span>
            <span className="text-2xl font-extrabold text-accent-dark mt-1 flex items-center space-x-1">
              <TrendingUp className="w-5 h-5 inline" />
              <span>Active</span>
            </span>
          </div>
        </div>
      )}

      {/* Table / Timeline */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Assessment History Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            You haven't performed any assessments yet. Run your first assessment to build your alternative credit timeline.
          </p>
          <Link
            to="/assess"
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md"
          >
            <span>Start First Assessment</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Historical Evaluation Records</h3>
            <span className="text-xs text-slate-500">{history.length} Record{history.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Trust Score</th>
                  <th className="px-6 py-3.5">Score Band</th>
                  <th className="px-6 py-3.5">Repayment Prob.</th>
                  <th className="px-6 py-3.5">ML Algorithm</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/assessment/${record.id}`)}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                      {new Date(record.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-sm text-slate-900">
                      {record.trust_score}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {record.score_band}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                      {(record.repayment_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {record.algorithm}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/assessment/${record.id}`);
                        }}
                        className="inline-flex items-center space-x-1 text-primary hover:text-primary-light font-bold"
                      >
                        <span>View SHAP</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
