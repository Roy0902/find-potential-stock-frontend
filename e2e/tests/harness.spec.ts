import { test, expect } from '@fixturesetup';
import { getLocatorByRole, getLocatorByText } from 'vasu-playwright-utils';

/**
 * Harness self-check. This is not part of any frozen plan: it proves the
 * Playwright config, the `@fixturesetup` alias, the element helpers, and
 * the page fixture work before the first feature is authored.
 *
 * Delete it once the first frozen feature has real tests.
 */
test('local harness is wired up @smoke', async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>find-potential-stock</h1>
      <a href="/about">About</a>
    </main>
  `);

  await expect(getLocatorByRole('heading', { name: 'find-potential-stock' })).toBeVisible();
  await expect(getLocatorByText('About')).toHaveAttribute('href', '/about');
  expect(page.url()).toBe('about:blank');
});
