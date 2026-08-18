import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import type { 
  AdminDashboardData, 
  ModelComparisonData, 
  DatasetStats 
} from '../types';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  AlertCircle,
  Zap
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [modelsData, setModelsData] = useState<ModelComparisonData | null>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchData = async () => {
    try {
      const [dash, models, datasets] = await Promise.allSettled([
        adminApi.getDashboard(),
        adminApi.getModels(),
        adminApi.getDatasets()
      ]);

      if (dash.status === 'fulfilled') setDashboard(dash.value);
      if (models.status === 'fulfilled') setModelsData(models.value);
      if (datasets.status === 'fulfilled') setDatasetStats(datasets.value);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivateModel = async (modelKey: string) => {
    setActionLoading(`activate_${modelKey}`);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await adminApi.activateModel(modelKey);
      setSuccessMessage(res.message || `Activated model ${modelKey}`);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to switch model.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetrain = async () => {
    setActionLoading('retrain');
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await adminApi.trainModels(15000, 42);
      setSuccessMessage(`Models retrained successfully! Active algorithm: ${res.active_model}`);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Retraining failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateData = async () => {
    setActionLoading('generate_data');
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await adminApi.generateDataset(20000);
      setSuccessMessage(`Generated ${res.records_generated} synthetic financial records.`);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Data generation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>MLOps & Risk Governance Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Admin Model Arena & Data Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor model benchmark metrics, execute synthetic dataset runs, and dynamically switch production scoring algorithms.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
            title="Refresh Metrics"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRetrain}
            disabled={actionLoading === 'retrain'}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 text-accent ${actionLoading === 'retrain' ? 'animate-spin' : ''}`} />
            <span>{actionLoading === 'retrain' ? 'Retraining...' : 'Retrain All Models'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Platform Users
            </span>
            <span className="text-2xl font-black text-slate-900 font-sans">
              {dashboard.metrics.total_users}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Assessments
            </span>
            <span className="text-2xl font-black text-slate-900 font-sans">
              {dashboard.metrics.total_assessments}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Trust Score
            </span>
            <span className="text-2xl font-black text-emerald-600 font-sans">
              {dashboard.metrics.average_trust_score}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Production Model
            </span>
            <span className="text-xl font-bold text-primary font-mono truncate block">
              {dashboard.metrics.active_model}
            </span>
          </div>
        </div>
      )}

      {/* Model Arena Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-primary flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-accent-dark" />
              <span>Machine Learning Model Comparison Arena</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated on an independent, hold-out test set (3,000 uncorrupted records)
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Active: <strong>{modelsData?.active_model_name}</strong>
          </span>
        </div>

        {modelsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(modelsData.models).map(([key, model]) => {
              const isActive = modelsData.active_model === key;
              const m = model.metrics;

              return (
                <div
                  key={key}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                    isActive
                      ? 'bg-gradient-to-b from-white to-primary/5 border-primary shadow-md ring-2 ring-primary/20'
                      : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{model.algorithm}</h3>
                        <span className="text-[11px] text-slate-400 font-mono">v{model.version}</span>
                      </div>
                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                          Candidate
                        </span>
                      )}
                    </div>

                    {/* Benchmark Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 block">ROC-AUC</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          {m.roc_auc.toFixed(4)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 block">PR-AUC</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          {m.pr_auc.toFixed(4)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 block">F1-Score</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          {m.f1.toFixed(4)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 block">Recall</span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono">
                          {m.recall.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Confusion Matrix Mini Pill */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/40 text-[11px] font-mono text-slate-600 flex justify-between">
                      <span>Brier Score: <strong>{m.brier_score.toFixed(4)}</strong></span>
                      <span>N = {m.sample_size}</span>
                    </div>
                  </div>

                  {/* Switch Action */}
                  <div>
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleActivateModel(key)}
                        disabled={actionLoading !== null}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-accent-dark" />
                        <span>Deploy Model to Production</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 rounded-xl bg-primary text-accent text-xs font-bold text-center">
                        Currently Serving Production Traffic
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dataset & Synthetic Engine Control */}
      {datasetStats && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Synthetic Financial Dataset Engine</h3>
                <p className="text-xs text-slate-500">Realistic multi-variate generator with calibrated non-linear repayment correlations</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateData}
              disabled={actionLoading === 'generate_data'}
              className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-light text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${actionLoading === 'generate_data' ? 'animate-spin' : ''}`} />
              <span>Generate 20k Synthetic Records</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 block">Total Training Records</span>
              <span className="text-xl font-bold text-slate-800 font-mono">
                {datasetStats.total_records.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 block">Feature Dimension</span>
              <span className="text-xl font-bold text-slate-800 font-mono">
                {datasetStats.feature_count} Columns
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 block">Target Class Balance</span>
              <span className="text-xl font-bold text-slate-800 font-mono">
                {(datasetStats.class_balance.positive_repayment_pct * 100).toFixed(0)}% / {(datasetStats.class_balance.negative_outcome_pct * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 block">Dataset File Size</span>
              <span className="text-xl font-bold text-slate-800 font-mono">
                {datasetStats.file_size_mb} MB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
