import { test as base, type Page } from '@playwright/test';
import { setPage } from 'vasu-playwright-utils';
import { waitForHydration } from '../utils/hydration.js';

/**
 * Shared fixture set for every spec.
 *
 * The `vasu-playwright-utils` helpers keep the current page in module state, so
 * every test must register it before using them. Specs import `test` from
 * `@fixturesetup`, never from `@playwright/test`.
 *
 * The frontend is server-rendered: the HTML is visible before React hydrates.
 * `page.goto` is wrapped so every full navigation waits for hydration before
 * the test can interact with the page. Client-side navigations afterwards run
 * in an already-hydrated app and need no extra wait.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);
    page.goto = ((url: string, options?: Parameters<Page['goto']>[1]) =>
      originalGoto(url, options).then(async (response) => {
        await waitForHydration(page);
        return response;
      })) as Page['goto'];

    setPage(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
export type { Page, APIResponse, Locator } from '@playwright/test';
