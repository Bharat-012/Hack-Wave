import {
  DashboardImpactMetrics,
  DuplicateCandidate,
  GeminiAnalysisResult,
  Quest,
  Report,
  ReportCategory,
  UserProfile,
} from '../types/index.js';

const RAW_BASE = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '';
const API_BASE = `${RAW_BASE}/api/v1`;

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const errorMsg = data?.error?.message || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data;
}

export const api = {
  // Health
  getHealth: () => fetch(`${RAW_BASE}/api/v1/health`).then((r) => r.json()),

  // Reports
  getReports: (params?: { status?: string; category?: string; is_demo?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.is_demo !== undefined) query.set('is_demo', String(params.is_demo));
    return fetchJSON<Report[]>(`${API_BASE}/reports?${query.toString()}`);
  },

  getReportById: (id: string) => fetchJSON<Report & { events: any[]; evidence: any[]; duplicates: DuplicateCandidate[] }>(`${API_BASE}/reports/${id}`),

  createReport: (reportData: {
    title: string;
    description: string;
    category: ReportCategory;
    severity: string;
    latitude: number;
    longitude: number;
    address: string;
    image_url: string;
    ai_analysis?: GeminiAnalysisResult;
  }) =>
    fetchJSON<Report>(`${API_BASE}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  checkDuplicates: (params: { latitude: number; longitude: number; category: string; exclude_id?: string }) =>
    fetchJSON<DuplicateCandidate[]>(`${API_BASE}/reports/check-duplicates`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  supportReport: (id: string) =>
    fetchJSON<{ supports_count: number; points_awarded: number; point_status: string }>(`${API_BASE}/reports/${id}/support`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  submitEvidence: (reportId: string, data: { image_url: string; notes?: string }) =>
    fetchJSON<any>(`${API_BASE}/reports/${reportId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  transitionReport: (reportId: string, data: { to_status: string; reason: string; resolution_type?: string }) =>
    fetchJSON<Report>(`${API_BASE}/reports/${reportId}/transition`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Quests
  getQuests: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetchJSON<Quest[]>(`${API_BASE}/quests${query}`);
  },

  getQuestById: (id: string) => fetchJSON<Quest>(`${API_BASE}/quests/${id}`),

  joinQuest: (id: string) =>
    fetchJSON<{ quest: Quest; member: any }>(`${API_BASE}/quests/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // AI Services
  analyzeImage: (image: string, userContext?: string) =>
    fetchJSON<GeminiAnalysisResult>(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      body: JSON.stringify({ image, userContext }),
    }),

  translateReport: (title: string, description: string, target_language: 'en' | 'hi') =>
    fetchJSON<{ translated_title: string; translated_description: string; confidence: string }>(`${API_BASE}/ai/translate-report`, {
      method: 'POST',
      body: JSON.stringify({ title, description, target_language }),
    }),

  generateQuestDraft: (report_id?: string, title?: string, category?: string, description?: string) =>
    fetchJSON<any>(`${API_BASE}/ai/generate-quest`, {
      method: 'POST',
      body: JSON.stringify({ report_id, title, category, description }),
    }),

  // Dashboard & Leaderboard
  getImpactMetrics: () => fetchJSON<DashboardImpactMetrics>(`${API_BASE}/dashboard/impact`),

  getLeaderboard: () => fetchJSON<UserProfile[]>(`${API_BASE}/leaderboard`),
};
