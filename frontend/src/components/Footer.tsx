import React from 'react';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-dark text-slate-400 py-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <span className="text-xl font-bold tracking-tight">
                Credit<span className="text-accent">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Bridging the credit gap for unbanked and gig-economy workers through alternative behavioral intelligence,
              explainable machine learning (TreeSHAP), and rigorous responsible AI governance.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-accent border border-slate-700">
                <Cpu className="w-3 h-3 mr-1 text-accent" />
                XGBoost + TreeSHAP Engine
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                <Lock className="w-3 h-3 mr-1" />
                Fairness Audited
              </span>
            </div>
          </div>

          {/* User Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/assess" className="hover:text-accent transition-colors">Assess Financial Profile</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors">Trust Score (0-900)</Link>
              </li>
              <li>
                <Link to="/why-this-score" className="hover:text-accent transition-colors">SHAP Explainability</Link>
              </li>
              <li>
                <Link to="/simulator" className="hover:text-accent transition-colors">AI What-If Simulator</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-accent transition-colors">Assessment History</Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Science */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Responsible AI</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/responsible-ai" className="hover:text-accent transition-colors">Methodology & Transparency</Link>
              </li>
              <li>
                <Link to="/responsible-ai" className="hover:text-accent transition-colors">Fairness Disparity Metrics</Link>
              </li>
              <li>
                <Link to="/responsible-ai" className="hover:text-accent transition-colors">Model Limitations</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent transition-colors">Admin Governance Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Scientific Disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p>
            &copy; 2026 CreditBridge AI. Strictly for demonstration & research. CreditBridge Trust Score is an alternative AI intelligence metric and does not constitute a bureau score (e.g. CIBIL/FICO).
          </p>
          <p className="text-slate-400 font-medium">
            "From Credit Invisible to Financially Visible"
          </p>
        </div>
      </div>
    </footer>
  );
};
