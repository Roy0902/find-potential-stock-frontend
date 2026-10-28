import { en } from '@/locales/en';

const base = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

type Envelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type CommentUnavailable = {
  code: number;
  message: string;
  data: { sourceUrl: string | null } | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly sourceUrl: string | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    const data =
      details.data && typeof details.data === 'object'
        ? (details.data as Record<string, unknown>)
        : {};
    this.sourceUrl = typeof data.sourceUrl === 'string' ? data.sourceUrl : null;
  }
}

function isEnvelope(body: unknown): body is Envelope<unknown> {
  return (
    !!body &&
    typeof body === 'object' &&
    'code' in body &&
    'message' in body &&
    'data' in body
  );
}

async function read<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const envelope = isEnvelope(body) ? body : undefined;
    throw new ApiError(
      response.status,
      String(envelope?.code ?? response.status),
      envelope?.message ?? en.errors.requestFailed,
      body && typeof body === 'object' ? (body as Record<string, unknown>) : {},
    );
  }

  if (isEnvelope(body)) return body.data as T;
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${base}${path}`, { credentials: 'include' });
  return read<T>(response);
}

export async function apiSend<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return read<T>(response);
}
