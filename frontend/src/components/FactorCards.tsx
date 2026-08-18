import React from 'react';
import type { FactorRating } from '../types';
import { 
  ShieldCheck, 
  Wallet, 
  PiggyBank, 
  Activity, 
  Smartphone
} from 'lucide-react';

interface FactorCardsProps {
  factors: {
    payment_reliability: FactorRating;
    income_stability: FactorRating;
    savings_discipline: FactorRating;
    transaction_consistency: FactorRating;
    digital_activity: FactorRating;
  };
}

export const FactorCards: React.FC<FactorCardsProps> = ({ factors }) => {
  const pillarConfigs = [
    {
      key: 'payment_reliability' as const,
      title: 'Payment Reliability',
      icon: ShieldCheck,
      color: 'emerald',
      bgGrad: 'from-emerald-500/10 to-teal-500/5',
      barColor: 'bg-emerald-500',
      data: factors.payment_reliability
    },
    {
      key: 'income_stability' as const,
      title: 'Income Stability',
      icon: Wallet,
      color: 'blue',
      bgGrad: 'from-blue-500/10 to-indigo-500/5',
      barColor: 'bg-blue-500',
      data: factors.income_stability
    },
    {
      key: 'savings_discipline' as const,
      title: 'Savings Discipline',
      icon: PiggyBank,
      color: 'amber',
      bgGrad: 'from-amber-500/10 to-orange-500/5',
      barColor: 'bg-amber-500',
      data: factors.savings_discipline
    },
    {
      key: 'transaction_consistency' as const,
      title: 'Transaction Consistency',
      icon: Activity,
      color: 'purple',
      bgGrad: 'from-purple-500/10 to-violet-500/5',
      barColor: 'bg-purple-500',
      data: factors.transaction_consistency
    },
    {
      key: 'digital_activity' as const,
      title: 'Digital Footprint & Tenure',
      icon: Smartphone,
      color: 'cyan',
      bgGrad: 'from-cyan-500/10 to-sky-500/5',
      barColor: 'bg-cyan-500',
      data: factors.digital_activity
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Exceptional':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Strong':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-primary">5 Pillars of Alternative Trust</h3>
          <p className="text-xs text-slate-500">Deconstructed creditworthiness based on transparent behavioral vectors</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Normalized Scale: 0–100
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillarConfigs.map((pillar) => {
          const Icon = pillar.icon;
          const rating = pillar.data;
          if (!rating) return null;

          return (
            <div
              key={pillar.key}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${pillar.bgGrad} border border-slate-200/60`}>
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{pillar.title}</h4>
                      <span className="text-[11px] font-medium text-slate-400">Weight: {rating.weight}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(rating.status)}`}>
                    {rating.status}
                  </span>
                </div>

                {/* Score Progress */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">Sub-score:</span>
                    <span className="font-bold text-slate-800 text-sm">{Math.round(rating.score)} <span className="text-[10px] font-normal text-slate-400">/ 100</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${pillar.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, rating.score))}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                  {rating.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
