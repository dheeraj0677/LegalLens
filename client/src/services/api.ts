import {
  DocumentAnalysisResult,
  DocumentComparisonResult,
  SimplifiedResult,
  QAResult,
  SampleDocumentPreset,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '') + '/api';

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const data = await res.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      // Body wasn't JSON
    }
    throw new ApiError(errorMsg, res.status);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{
      status: string;
      service: string;
      model: string;
      hasActiveKey: boolean;
    }>(res);
  },

  async getSampleDocuments(): Promise<{ count: number; presets: SampleDocumentPreset[] }> {
    const res = await fetch(`${API_BASE}/sample-docs`);
    return handleResponse<{ count: number; presets: SampleDocumentPreset[] }>(res);
  },

  async analyzeDocument(text: string, title?: string): Promise<DocumentAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title }),
    });
    return handleResponse<DocumentAnalysisResult>(res);
  },

  async compareDocuments(
    docA: string,
    docB: string,
    titleA?: string,
    titleB?: string
  ): Promise<DocumentComparisonResult> {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docA, docB, titleA, titleB }),
    });
    return handleResponse<DocumentComparisonResult>(res);
  },

  async simplifyText(text: string): Promise<SimplifiedResult> {
    const res = await fetch(`${API_BASE}/simplify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse<SimplifiedResult>(res);
  },

  async askQuestion(documentText: string, question: string): Promise<QAResult> {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText, question }),
    });
    return handleResponse<QAResult>(res);
  },
};
