import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi, authApi } from '../services/api';
import type { PersonaPreset } from '../types';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { 
  Sparkles, 
  User, 
  Lightbulb, 
  ShieldCheck, 
  Layers,
  Car,
  Store,
  Palette,
  GraduationCap
} from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [personas, setPersonas] = useState<Record<string, PersonaPreset>>({});
  const [selectedKey, setSelectedKey] = useState<string>('gig_worker');
  const [activeProfile, setActiveProfile] = useState<Record<string, any> | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(710);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initSimulator = async () => {
      setLoading(true);
      try {
        const [personaData, latestAssessment] = await Promise.allSettled([
          authApi.getSamplePersonas(),
          assessmentApi.getLatest()
        ]);

        if (personaData.status === 'fulfilled') {
          setPersonas(personaData.value);
        }

        if (latestAssessment.status === 'fulfilled' && latestAssessment.value.raw_features) {
          setActiveProfile(latestAssessment.value.raw_features);
          setCurrentScore(latestAssessment.value.trust_score);
          setSelectedKey('my_profile');
        } else if (personaData.status === 'fulfilled' && Object.keys(personaData.value).length > 0) {
          const firstKey = Object.keys(personaData.value)[0];
          setActiveProfile(personaData.value[firstKey]);
          setCurrentScore(710);
          setSelectedKey(firstKey);
        }
      } catch (err) {
        console.error('Simulator init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSimulator();
  }, []);

  const handlePersonaSelect = (key: string) => {
    setSelectedKey(key);
    if (key === 'my_profile') {
      assessmentApi.getLatest().then((res) => {
        if (res.raw_features) {
          setActiveProfile(res.raw_features);
          setCurrentScore(res.trust_score);
        }
      });
    } else if (personas[key]) {
      setActiveProfile(personas[key]);
      // Estimate baseline score
      if (key === 'gig_worker') setCurrentScore(718);
      else if (key === 'street_vendor') setCurrentScore(642);
      else if (key === 'rural_artisan') setCurrentScore(595);
      else setCurrentScore(752);
    }
  };

  const personaIcons: Record<string, any> = {
    gig_worker: Car,
    street_vendor: Store,
    rural_artisan: Palette,
    first_time_professional: GraduationCap
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-dark" />
            <span>Counterfactual Credit Modeling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            AI What-If Scenario Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Simulate how financial habits (e.g. paying utility bills on-time or expanding savings buffer) directly elevate creditworthiness.
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

      {/* Preset Persona Selector */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Choose Baseline Profile to Simulate:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => handlePersonaSelect('my_profile')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedKey === 'my_profile'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <User className={`w-4 h-4 ${selectedKey === 'my_profile' ? 'text-accent' : 'text-primary'}`} />
              <span className="text-xs font-bold truncate">My Current Profile</span>
            </div>
            <span className={`text-[10px] block ${selectedKey === 'my_profile' ? 'text-slate-200' : 'text-slate-500'}`}>
              Assessed Data
            </span>
          </button>

          {Object.entries(personas).map(([key, persona]) => {
            const Icon = personaIcons[key] || User;
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePersonaSelect(key)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-primary'}`} />
                  <span className="text-xs font-bold truncate">{persona.name.split(' (')[0]}</span>
                </div>
                <span className={`text-[10px] block truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {persona.occupation_category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Playground */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : activeProfile ? (
        <WhatIfSimulator
          baselineProfile={activeProfile}
          currentScore={currentScore}
        />
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm">Please select a persona profile to begin simulating.</p>
        </div>
      )}

      {/* Educational Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Immediate Counterfactual Feedback</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike static black-box bureau scores that update once a month, CreditBridge computes live marginal TreeSHAP deltas instantly.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700 w-fit">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Habit-Forming Guidance</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Borrowers can clearly see that paying electricity bills on-time for 60 days yields up to +35 score points, incentivizing positive financial habits.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 w-fit">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Lender Prescreening Tool</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Underwriters can adjust risk thresholds to determine conditional loan approvals (e.g. "Approved with auto-debit requirement").
          </p>
        </div>
      </div>
    </div>
  );
};
