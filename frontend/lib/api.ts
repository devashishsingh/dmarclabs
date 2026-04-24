import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for large file analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Types ----

export interface UploadResponse {
  sessionId: string;
  fileName: string;
  fileSize: number;
  status: string;
}

export interface WhoisData {
  owner: string;
  asn: string;
  country: string;
  threatLevel: 'TRUSTED' | 'NEUTRAL' | 'SUSPICIOUS' | 'UNKNOWN';
  lastUpdated: string;
}

export interface IPRecord {
  ip: string;
  emailVolume: number;
  dmarc: { pass: number; fail: number; passRate: string };
  spf: { pass: number; fail: number; passRate: string };
  dkim: { pass: number; fail: number; passRate: string };
  whois: WhoisData;
}

export interface AnalysisSummary {
  totalEmails: number;
  dmarcPassRate: string;
  totalIPs: number;
  processingTime: string;
}

export interface AnalyzeResponse {
  sessionId: string;
  summary: AnalysisSummary;
  results: IPRecord[];
  expiresAt: string;
}

export interface AccessRequestPayload {
  name: string;
  email: string;
  organization: string;
  fileSize: number;
  useCase: string;
}

// ---- API Functions ----

/**
 * Upload a DMARC XML file. Returns sessionId for subsequent analysis.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
}

/**
 * Trigger analysis for a previously uploaded session.
 */
export async function analyzeSession(sessionId: string): Promise<AnalyzeResponse> {
  const response = await apiClient.post<AnalyzeResponse>('/api/analyze', { sessionId });
  return response.data;
}

/**
 * Purge a session and all associated data immediately.
 */
export async function purgeSession(sessionId: string): Promise<void> {
  await apiClient.post('/api/purge', { sessionId });
}

/**
 * Submit an access request for >100MB files.
 */
export async function submitAccessRequest(payload: AccessRequestPayload): Promise<void> {
  await apiClient.post('/api/request-access', payload);
}

/**
 * Submit user feedback.
 */
export async function submitFeedback(
  sentiment: 'positive' | 'neutral' | 'negative',
  message: string,
  sessionId: string
): Promise<void> {
  await apiClient.post('/api/feedback', { sentiment, message, sessionId });
}

export default apiClient;
