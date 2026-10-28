/**
 * Test helpers for the SSR API failure proxy.
 *
 * The server-rendered frontend fetch data in Node, outside the browser, so
 * `page.route` cannot intercept it. The Playwright config points the frontend's
 * `API_PROXY_TARGET` at `tests/support/api-failure-proxy.mjs`, and these helpers
 * toggle that proxy from a test.
 */

const DEFAULT_PROXY_URL = 'http://127.0.0.1:3100';

export type ApiFailure = {
  /** Request path prefix to fail, for example `/api/comments`. */
  pattern: string;
  /** HTTP status returned by the proxy. Defaults to 503. */
  status?: number;
  /** JSON body returned by the proxy. */
  body?: unknown;
};

function proxyUrl(): string {
  return process.env.FAILURE_PROXY_URL ?? DEFAULT_PROXY_URL;
}

async function setApiFailure(failure: ApiFailure | null): Promise<void> {
  const url = `${proxyUrl()}/__fail`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(failure ?? { pattern: null }),
    });
  } catch (error) {
    throw new Error(
      `Cannot reach the SSR API failure proxy at ${url}. ` +
        'Start the test web servers without START_WEB_SERVER=0, or run ' +
        '`node tests/support/api-failure-proxy.mjs` with API_PROXY_TARGET pointing at it.',
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(`The SSR API failure proxy returned HTTP ${response.status} for ${url}.`);
  }
}

/**
 * Runs `work` with a proxy-injected API failure, then always clears it.
 */
export async function withApiFailure<T>(
  failure: ApiFailure,
  work: () => Promise<T>,
): Promise<T> {
  await setApiFailure(failure);
  try {
    return await work();
  } finally {
    await setApiFailure(null);
  }
}
