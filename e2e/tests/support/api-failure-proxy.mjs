import http from 'node:http';

/**
 * Test-only passthrough proxy for the SSR API.
 *
 * The frontend's server loaders call the backend directly, so Playwright's
 * `page.route` cannot see or intercept those requests. The Playwright config
 * points the SSR runtime at this proxy instead:
 *
 *   PORT   - port to listen on (default 3100)
 *   HOST   - interface to bind (default 127.0.0.1)
 *   TARGET - backend base URL (default http://localhost:3000)
 *
 * Control endpoints:
 *   GET  /__health -> { ok: true }
 *   GET  /__fail   -> { failure }
 *   POST /__fail   -> { pattern, status?, body? } to inject, { pattern: null } to clear
 *
 * A failure matches when the request path starts with `pattern`, for example
 * `/api/comments`. Everything else is piped to the backend unchanged.
 */

const port = Number(process.env.PORT ?? '3100');
const host = process.env.HOST ?? '127.0.0.1';
const target = new URL(process.env.TARGET ?? 'http://localhost:3000');

/** @type {{ pattern: string, status: number, body: unknown } | null} */
let failure = null;

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);

  if (url.pathname === '/__health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === '/__fail') {
    if (request.method === 'GET') {
      sendJson(response, 200, { failure });
      return;
    }
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'method not allowed' });
      return;
    }

    try {
      const raw = await readBody(request);
      const payload = raw.length ? JSON.parse(raw.toString('utf8')) : {};
      failure = payload.pattern
        ? {
            pattern: String(payload.pattern),
            status: Number(payload.status ?? 503),
            body: payload.body ?? {
              code: 'UPSTREAM_UNAVAILABLE',
              message: 'Injected upstream failure',
            },
          }
        : null;
      sendJson(response, 200, { failure });
    } catch {
      sendJson(response, 400, { error: 'invalid JSON body' });
    }
    return;
  }

  if (failure && url.pathname.startsWith(failure.pattern)) {
    response.writeHead(failure.status, { 'content-type': 'application/json; charset=utf-8' });
    response.end(typeof failure.body === 'string' ? failure.body : JSON.stringify(failure.body));
    return;
  }

  const upstream = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: request.url,
      method: request.method,
      headers: { ...request.headers, host: target.host },
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', (error) => {
    if (!response.headersSent) {
      sendJson(response, 502, { code: 'PROXY_UNAVAILABLE', message: error.message });
      return;
    }
    response.end();
  });

  request.pipe(upstream);
});

server.listen(port, host, () => {
  console.log(`[api-failure-proxy] listening on http://${host}:${port} -> ${target.href}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
