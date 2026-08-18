import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  LogOut, 
  BarChart3, 
  Sliders, 
  History, 
  Layers, 
  FileText, 
  Sparkles, 
  Lock 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark via-primary to-primary-light flex items-center justify-center text-accent shadow-md group-hover:shadow-glow transition-all duration-300">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-bold text-primary tracking-tight font-sans block leading-none">
              Credit<span className="text-accent-dark font-extrabold">Bridge</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block mt-0.5">
              Alternative AI Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Trust Score</span>
              </Link>
              <Link
                to="/why-this-score"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/why-this-score')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <Sparkles className="w-4 h-4 text-accent-dark" />
                <span>Why This Score?</span>
              </Link>
              <Link
                to="/simulator"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/simulator')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>AI Simulator</span>
              </Link>
              <Link
                to="/history"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/history')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
              <Link
                to="/responsible-ai"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/responsible-ai')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-100/70'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Responsible AI</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/responsible-ai"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/responsible-ai') ? 'text-primary font-semibold' : 'text-slate-600 hover:text-primary'
                }`}
              >
                Methodology & Ethics
              </Link>
            </>
          )}
        </nav>

        {/* User / Admin Action Area */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-lg bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-semibold flex items-center space-x-1 hover:bg-amber-200 transition-colors shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <Link
                to="/assess"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>New Assessment</span>
              </Link>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-primary-dark/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
                  {user?.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <p className="font-semibold text-slate-800 truncate max-w-[120px]">{user?.full_name}</p>
                  <span className="text-[10px] text-slate-500 capitalize">{user?.role.toLowerCase()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/assess"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>Check Trust Score</span>
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
