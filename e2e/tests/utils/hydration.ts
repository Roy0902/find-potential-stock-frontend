import type { Page } from '@playwright/test';

/** How long to wait for the SSR document to become interactive. */
const HYDRATION_TIMEOUT = 30_000;

/**
 * Evaluated in the browser. React Router 7 exposes the decoded router state as
 * `window.__reactRouterContext.state`; the React DOM commit adds
 * `__reactProps$<id>` to hydrated host elements. Waiting for both markers means
 * clicks and typing cannot race the hydration pass, which would otherwise fall
 * back to native form submits or no-ops.
 *
 * Kept as a string so runners that transpile with esbuild (for example `tsx`)
 * do not inject a `__name` helper that is missing in the browser context.
 */
const HYDRATION_PREDICATE = `(() => {
  const context = window.__reactRouterContext;
  const hasReactProps = (element) =>
    element !== null &&
    Object.getOwnPropertyNames(element).some((key) => key.startsWith('__reactProps$'));
  return (
    Boolean(context && context.state) &&
    (hasReactProps(document.body) || hasReactProps(document.documentElement))
  );
})()`;

/**
 * Waits until React Router's SSR payload has been decoded and React has
 * committed the hydrated tree to the DOM.
 */
export async function waitForHydration(page: Page): Promise<void> {
  try {
    await page.waitForFunction(HYDRATION_PREDICATE, undefined, {
      timeout: HYDRATION_TIMEOUT,
    });
  } catch (error) {
    throw new Error(
      `The SSR app did not hydrate within ${HYDRATION_TIMEOUT}ms. ` +
        'Check the frontend server logs for a hydration error or a failed loader.',
      { cause: error },
    );
  }
}
