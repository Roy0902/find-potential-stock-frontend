import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToReadableStream } from 'react-dom/server.browser';

// Give loaders time to settle before React rejects the render.
export const streamTimeout = 10_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  let shellRendered = false;
  const userAgent = request.headers.get('user-agent') ?? '';

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: AbortSignal.timeout(streamTimeout + 1_000),
      onError(error: unknown) {
        if (shellRendered) {
          console.error(error);
        } else {
          responseStatusCode = 500;
        }
      },
    },
  );
  shellRendered = true;

  // Crawlers should receive the complete document, not a partial stream.
  if (/bot|crawler|spider|slurp|bingpreview/i.test(userAgent)) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
