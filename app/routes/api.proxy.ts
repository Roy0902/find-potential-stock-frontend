import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

// Headers the runtime recalculates when it makes the upstream request.
const REQUEST_HEADERS_TO_DROP = new Set([
  ...HOP_BY_HOP,
  'accept-encoding',
  'content-length',
  'expect',
  'host',
]);

// Headers that describe an encoding the runtime may already have removed.
const RESPONSE_HEADERS_TO_DROP = new Set([
  ...HOP_BY_HOP,
  'content-encoding',
  'content-length',
]);

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ code: status, message, data: null }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function apiTarget(): string | null {
  const raw = process.env.API_PROXY_TARGET?.trim();
  return raw ? raw.replace(/\/+$/, '') : null;
}

async function proxy(request: Request): Promise<Response> {
  const base = apiTarget();
  if (!base) {
    return jsonError(503, 'API_PROXY_TARGET is not configured.');
  }

  const incoming = new URL(request.url);
  const target = new URL(`${incoming.pathname}${incoming.search}`, base);
  const method = request.method.toUpperCase();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!REQUEST_HEADERS_TO_DROP.has(key)) headers.set(key, value);
  });
  headers.set('x-forwarded-host', incoming.host);
  headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''));

  const init: RequestInit = { method, headers, redirect: 'manual' };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (error) {
    console.error('API proxy request failed', error);
    return jsonError(502, 'Could not reach the API server.');
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!RESPONSE_HEADERS_TO_DROP.has(key)) responseHeaders.set(key, value);
  });

  const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  if (typeof getSetCookie === 'function') {
    const cookies = getSetCookie.call(upstream.headers);
    if (cookies.length) {
      responseHeaders.delete('set-cookie');
      for (const cookie of cookies) responseHeaders.append('set-cookie', cookie);
    }
  }

  return new Response(method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  return proxy(request);
}

export function action({ request }: ActionFunctionArgs): Promise<Response> {
  return proxy(request);
}
