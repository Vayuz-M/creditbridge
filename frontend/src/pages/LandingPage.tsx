import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-[#f7f9fc] to-[#edf2f7]">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag / Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Alternative Financial Intelligence Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary tracking-tight font-sans leading-[1.15]">
              Credit Intelligence <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-secondary">
                Beyond Traditional Credit History
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Over 300 million people lack traditional bureau records. CreditBridge uses 
              <strong className="text-primary font-semibold"> UPI behavior, utility consistency, income regularity, and savings discipline </strong>
              to generate an explainable, fair, and responsible Trust Score (300–850).
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/assess"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white text-base font-semibold shadow-lg hover:shadow-glow transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Check My Trust Score</span>
                <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/responsible-ai"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>How It Works & Ethics</span>
              </Link>
            </div>

            {/* Quick Proof Points */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-200/80 mt-10">
              <div className="p-3 bg-white/70 backdrop-blur rounded-xl border border-slate-200/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">300–850</span>
                <span className="text-xs text-slate-500 font-medium">CreditBridge Trust Score</span>
              </div>
              <div className="p-3 bg-white/70 backdrop-blur rounded-xl border border-slate-200/60 shadow-sm">
                <span className="block text-2xl font-bold text-accent-dark">TreeSHAP</span>
                <span className="text-xs text-slate-500 font-medium">Explainable Factors</span>
              </div>
              <div className="p-3 bg-white/70 backdrop-blur rounded-xl border border-slate-200/60 shadow-sm">
                <span className="block text-2xl font-bold text-emerald-600">Zero</span>
                <span className="text-xs text-slate-500 font-medium">Bureau History Needed</span>
              </div>
              <div className="p-3 bg-white/70 backdrop-blur rounded-xl border border-slate-200/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">Audited</span>
                <span className="text-xs text-slate-500 font-medium">Responsible AI Fairness</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-accent-dark mb-2">The Structural Problem</h2>
            <p className="text-3xl font-bold text-primary tracking-tight">The Credit Invisibility Trap</p>
            <p className="text-sm text-slate-600 mt-2">
              Traditional credit bureaus rely exclusively on past formal loan repayment data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-4">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Legacy Bureau Models</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Locked Out by The Cold-Start Dilemma</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>No credit card or past bank loan = "No Hit / N/A" bureau score</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Black-box rejection notices with zero explanations or remedy steps</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Gig workers and small merchants forced to predatory informal loans</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* The CreditBridge Way */}
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CreditBridge Alternative Intelligence</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Holistic Behavioral Evaluation</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Evaluates UPI cash velocity, electricity bills, rent regularity</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>100% Explainable TreeSHAP feature attributions and actionable guidance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Interactive "What-If" simulator for proactive financial improvement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Pillars Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-accent-dark mb-2">Scientific Framework</h2>
            <p className="text-3xl font-bold text-primary tracking-tight">The 5 Pillars of Alternative Trust</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Payment Reliability (35%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consistency of recurring utility bills (electricity, water, broadband) and mobile top-ups.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Income Stability (25%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cash-flow regularity and income diversification across gig platforms or merchant receipts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Savings Discipline (15%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Average monthly buffer retention and savings-to-earnings capacity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Transaction Consistency (15%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frequency and variance of digital UPI inflows and outflows.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                5
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Footprint (10%)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                UPI tenure, merchant interactions, and active participation in the digital economy.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-primary-light text-white flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-accent font-bold uppercase tracking-wider">Try It Live</span>
                <h3 className="text-lg font-bold mt-1">Ready to check your Trust Score?</h3>
                <p className="text-xs text-slate-200 mt-2">Takes less than 2 minutes. No hard credit checks.</p>
              </div>
              <Link
                to="/assess"
                className="w-full py-2.5 rounded-xl bg-accent text-primary text-xs font-bold text-center hover:bg-accent-light transition-colors"
              >
                Launch Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
