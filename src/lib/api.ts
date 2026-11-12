import type {
  BootstrapResponse,
  ComposeRequest,
  ComposeResponse,
  MediaServiceConfig,
  Post,
} from './apiTypes';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `API request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return payload as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export const api = {
  bootstrap: () => request<BootstrapResponse>('/bootstrap'),
  health: () => request<{ ok: boolean; ai: { aiEngine: 'llm' | 'structured' } }>('/health'),
  upsertPost: (payload: Post) => post<{ post: Post }>('/posts', payload),
  patchPost: (id: string, patch: Partial<Post>) =>
    request<{ post: Post }>(`/posts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  setAccount: (platform: string, connected: boolean) =>
    request<{ ok: boolean }>(`/accounts/${encodeURIComponent(platform)}`, {
      method: 'PATCH',
      body: JSON.stringify({ connected }),
    }),
  readThread: (id: string) => post<{ ok: boolean }>(`/inbox/${encodeURIComponent(id)}/read`, {}),
  readAll: () => post<{ ok: boolean }>('/inbox/read-all', {}),
  reply: (id: string, content: string) =>
    post<{ ok: boolean; message: { id: string; from: 'me'; text: string; at: string } }>(
      `/inbox/${encodeURIComponent(id)}/reply`,
      { content },
    ),
  patchThread: (id: string, patch: { status?: 'open' | 'resolved'; label?: string }) =>
    request<{ ok: boolean }>(`/inbox/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  compose: (body: ComposeRequest) => post<ComposeResponse>('/ai/compose', body),
  mediaConfig: () => request<MediaServiceConfig>('/media/config'),
};

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
