import axios from 'axios';
import type {
  User,
  Assessment,
  AssessmentSummary,
  SimulationResult,
  FairnessReport,
  ModelComparisonData,
  DatasetStats,
  AdminDashboardData,
  PersonaPreset
} from '../types';

const isHostedExternally = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('surge.sh')
);

const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (isHostedExternally ? 'https://creditbridge-api-2026.loca.lt/api' : '/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creditbridge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, full_name: string) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    return res.data;
  },
  demoLogin: async (role: 'USER' | 'ADMIN' = 'USER') => {
    const res = await api.post('/auth/demo-login', { role });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getSamplePersonas: async (): Promise<Record<string, PersonaPreset>> => {
    const res = await api.get('/auth/sample-personas');
    return res.data;
  }
};

// Assessment API
export const assessmentApi = {
  createAssessment: async (profileData: Record<string, any>): Promise<Assessment> => {
    const res = await api.post('/assessment', profileData);
    return res.data;
  },
  getHistory: async (): Promise<AssessmentSummary[]> => {
    const res = await api.get('/assessment/history');
    return res.data;
  },
  getLatest: async (): Promise<Assessment> => {
    const res = await api.get('/assessment/latest');
    return res.data;
  },
  getById: async (id: number): Promise<Assessment> => {
    const res = await api.get(`/assessment/${id}`);
    return res.data;
  },
  simulate: async (baseline_profile: Record<string, any>, modified_features: Record<string, any>): Promise<SimulationResult> => {
    const res = await api.post('/assessment/simulate', { baseline_profile, modified_features });
    return res.data;
  }
};

// Analytics API
export const analyticsApi = {
  getScoreAnalytics: async (assessmentId: number) => {
    const res = await api.get(`/analytics/score/${assessmentId}`);
    return res.data;
  },
  getExplanation: async (assessmentId: number) => {
    const res = await api.get(`/analytics/explanation/${assessmentId}`);
    return res.data;
  },
  getGlobalShap: async (topN: number = 10) => {
    const res = await api.get(`/analytics/global-shap?top_n=${topN}`);
    return res.data;
  },
  getFairnessReport: async (): Promise<FairnessReport> => {
    const res = await api.get('/analytics/fairness');
    return res.data;
  }
};

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  getAssessments: async () => {
    const res = await api.get('/admin/assessments');
    return res.data;
  },
  getDatasets: async (): Promise<DatasetStats> => {
    const res = await api.get('/admin/datasets');
    return res.data;
  },
  generateDataset: async (nSamples: number = 20000) => {
    const res = await api.post('/admin/dataset/generate', { n_samples: nSamples });
    return res.data;
  },
  getModels: async (): Promise<ModelComparisonData> => {
    const res = await api.get('/admin/models');
    return res.data;
  },
  trainModels: async (nSamples: number = 15000, randomSeed: number = 42) => {
    const res = await api.post('/admin/model/train', { n_samples: nSamples, random_seed: randomSeed });
    return res.data;
  },
  activateModel: async (modelKey: string) => {
    const res = await api.post('/admin/models/activate', { model_key: modelKey });
    return res.data;
  }
};
