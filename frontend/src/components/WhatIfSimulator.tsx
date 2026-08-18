import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../services/api';
import type { SimulationResult } from '../types';
import { 
  Sliders, 
  RotateCcw, 
  Zap
} from 'lucide-react';

interface WhatIfSimulatorProps {
  baselineProfile: Record<string, any>;
  currentScore: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baselineProfile,
  currentScore
}) => {
  // Configurable simulation sliders
  const [onTimeRatio, setOnTimeRatio] = useState<number>(
    baselineProfile?.on_time_payment_ratio ?? 0.85
  );
  const [monthlySavings, setMonthlySavings] = useState<number>(
    baselineProfile?.monthly_savings ?? 5000
  );
  const [paymentDelay, setPaymentDelay] = useState<number>(
    baselineProfile?.average_payment_delay ?? 5
  );
  const [transactionConsistency, setTransactionConsistency] = useState<number>(
    baselineProfile?.transaction_consistency ?? 0.80
  );
  const [electricityConsistency, setElectricityConsistency] = useState<number>(
    baselineProfile?.electricity_payment_consistency ?? 0.90
  );

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync whenever baseline changes
  useEffect(() => {
    if (baselineProfile) {
      setOnTimeRatio(baselineProfile.on_time_payment_ratio ?? 0.85);
      setMonthlySavings(baselineProfile.monthly_savings ?? 5000);
      setPaymentDelay(baselineProfile.average_payment_delay ?? 5);
      setTransactionConsistency(baselineProfile.transaction_consistency ?? 0.80);
      setElectricityConsistency(baselineProfile.electricity_payment_consistency ?? 0.90);
    }
  }, [baselineProfile]);

  // Run simulation whenever values change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!baselineProfile) return;
      setLoading(true);
      try {
        const modified = {
          on_time_payment_ratio: onTimeRatio,
          monthly_savings: monthlySavings,
          average_payment_delay: paymentDelay,
          transaction_consistency: transactionConsistency,
          electricity_payment_consistency: electricityConsistency
        };
        const result = await assessmentApi.simulate(baselineProfile, modified);
        setSimulation(result);
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [onTimeRatio, monthlySavings, paymentDelay, transactionConsistency, electricityConsistency, baselineProfile]);

  const handleReset = () => {
    if (baselineProfile) {
      setOnTimeRatio(baselineProfile.on_time_payment_ratio ?? 0.85);
      setMonthlySavings(baselineProfile.monthly_savings ?? 5000);
      setPaymentDelay(baselineProfile.average_payment_delay ?? 5);
      setTransactionConsistency(baselineProfile.transaction_consistency ?? 0.80);
      setElectricityConsistency(baselineProfile.electricity_payment_consistency ?? 0.90);
    }
  };

  const delta = simulation ? simulation.score_delta : 0;
  const isPositiveDelta = delta >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">Interactive "What-If" Scenario Simulator</h3>
            <p className="text-xs text-slate-500">
              Test how targeted financial habits (e.g. paying utility bills on time, increasing savings) can directly uplift your Trust Score.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Outcome Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Baseline Score
          </span>
          <span className="text-3xl font-extrabold text-slate-700 font-sans block my-1">
            {simulation?.current_score ?? currentScore}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {simulation?.current_band ?? 'Standard'}
          </span>
        </div>

        {/* Arrow / Delta */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-center flex flex-col justify-center items-center shadow-md">
          <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
            Projected Impact
          </span>
          <div className="flex items-center justify-center space-x-1.5 my-1">
            <span
              className={`text-3xl font-black font-sans ${
                isPositiveDelta ? 'text-accent' : 'text-rose-300'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
            <span className="text-xs text-white/80 font-medium">pts</span>
          </div>
          <span className="text-[11px] text-slate-200 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-accent inline" />
            <span>{loading ? 'Recalculating ML model...' : 'Live Model Estimate'}</span>
          </span>
        </div>

        {/* Projected Score */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Simulated Target Score
          </span>
          <span className="text-3xl font-extrabold text-emerald-800 font-sans block my-1">
            {simulation?.simulated_score ?? currentScore}
          </span>
          <span className="text-xs font-bold text-emerald-700">
            {simulation?.simulated_band ?? 'Standard'}
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Slider 1: On-time bill payment */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-700">On-Time Bill Payment Ratio</label>
            <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border text-xs">
              {(onTimeRatio * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.40"
            max="1.00"
            step="0.05"
            value={onTimeRatio}
            onChange={(e) => setOnTimeRatio(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>40% (Frequent Delays)</span>
            <span>100% (Flawless)</span>
          </div>
        </div>

        {/* Slider 2: Monthly Savings */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-700">Monthly Savings Amount (₹)</label>
            <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border text-xs">
              ₹{monthlySavings.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30000"
            step="1000"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>₹0 / month</span>
            <span>₹30,000 / month</span>
          </div>
        </div>

        {/* Slider 3: Average Bill Payment Delay */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-700">Average Payment Delay (Days)</label>
            <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border text-xs">
              {paymentDelay} days
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={paymentDelay}
            onChange={(e) => setPaymentDelay(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0 days (Instant)</span>
            <span>30 days (High Delay)</span>
          </div>
        </div>

        {/* Slider 4: Transaction Consistency */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-700">UPI Transaction Consistency</label>
            <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border text-xs">
              {(transactionConsistency * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.30"
            max="1.00"
            step="0.05"
            value={transactionConsistency}
            onChange={(e) => setTransactionConsistency(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>30% (Erratic)</span>
            <span>100% (Highly Regular)</span>
          </div>
        </div>
      </div>

      {/* Sub-factor Shift Table */}
      {simulation?.factor_changes && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Projected Pillar Movement
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {simulation.factor_changes.map((fc, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{fc.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {Math.round(fc.baseline_score)} → {Math.round(fc.simulated_score)}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    fc.delta >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {fc.delta >= 0 ? `+${fc.delta.toFixed(1)}` : fc.delta.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
