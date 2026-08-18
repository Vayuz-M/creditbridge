import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  scoreBand: string;
  bandTier: string;
  bandColor?: string;
  repaymentProbability: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  scoreBand,
  bandTier,
  repaymentProbability,
  size = 'md'
}) => {
  // Score range: 300 to 850 (span = 550)
  const minScore = 300;
  const maxScore = 850;
  const clampedScore = Math.max(minScore, Math.min(maxScore, score));
  const percentage = ((clampedScore - minScore) / (maxScore - minScore)) * 100;

  // Arc calculations for SVG semi-circle gauge (180 deg)
  const radius = size === 'lg' ? 120 : size === 'md' ? 95 : 70;
  const strokeWidth = size === 'lg' ? 16 : size === 'md' ? 14 : 10;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Band colors mapping
  const getBadgeBg = () => {
    if (score >= 750) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 670) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 580) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getScoreColor = () => {
    if (score >= 750) return '#059669'; // Emerald
    if (score >= 670) return '#0d9488'; // Teal
    if (score >= 580) return '#d97706'; // Amber
    return '#e11d48'; // Rose
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* SVG Semi-Circle Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius + strokeWidth + 20}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              radius * 2 + strokeWidth
            },${radius + strokeWidth}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              radius * 2 + strokeWidth
            },${radius + strokeWidth}`}
            fill="none"
            stroke="url(#scoreGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Content */}
        <div
          className="absolute text-center flex flex-col items-center justify-center"
          style={{ top: size === 'lg' ? '38%' : '35%' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Trust Score
          </span>
          <div className="flex items-baseline justify-center space-x-1">
            <span
              className={`font-black tracking-tight ${
                size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-4xl' : 'text-3xl'
              }`}
              style={{ color: getScoreColor() }}
            >
              {score}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 850</span>
          </div>
          <div
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold mt-1 shadow-sm ${getBadgeBg()}`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{scoreBand}</span>
          </div>
        </div>
      </div>

      {/* Min / Max Range Markers */}
      <div
        className="flex justify-between w-full text-[10px] font-semibold text-slate-400 px-3 -mt-2"
        style={{ maxWidth: `${radius * 2 + strokeWidth * 2}px` }}
      >
        <span>300 (Subprime)</span>
        <span>850 (Exceptional)</span>
      </div>

      {/* Repayment Probability & Tier Info */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs text-center">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-medium text-slate-500 block">Est. Repayment Prob.</span>
          <span className="text-sm font-bold text-slate-800 flex items-center justify-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>{(repaymentProbability * 100).toFixed(1)}%</span>
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-medium text-slate-500 block">Credit Tier</span>
          <span className="text-sm font-bold text-primary">{bandTier}</span>
        </div>
      </div>
    </div>
  );
};
