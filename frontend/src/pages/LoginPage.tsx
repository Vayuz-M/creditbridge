import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'USER' | 'ADMIN') => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError('Demo login failed. Please ensure the backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-elevated">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-accent flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Sign in to CreditBridge</h2>
          <p className="text-xs text-slate-500">Access your alternative credit profile and trust analytics</p>
        </div>

        {/* Demo Fast-Login Pill Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-accent-dark" />
            <span>Hackathon Quick Access (1-Click Demo)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('USER')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('ADMIN')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary-light text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-accent" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold shadow-md hover:shadow-glow transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-accent" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
