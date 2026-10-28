import { test, expect } from '@fixturesetup';
import {
  expectElementToBeVisible,
  expectPageToHaveURL,
  fill,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';

/**
 * Regression coverage for SSR + live search. Not part of the frozen plans:
 * it guards the client-side search mode introduced with the SSR migration.
 */

const searchBox = () => getLocatorByRole('searchbox', { name: 'Search comments' });

test('typing switches the archive to search mode without a reload', async ({ page }) => {
  await gotoURL('/');
  await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Comment archive' }));

  const documentNavigations = await page.evaluate(
    () => performance.getEntriesByType('navigation').length,
  );

  await fill(searchBox(), 'Tesla');

  await expectPageToHaveURL('/search?q=Tesla');
  await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Search results' }));
  await expectElementToBeVisible(getLocatorByText('Search: Tesla'));

  expect(
    await page.evaluate(() => performance.getEntriesByType('navigation').length),
  ).toBe(documentNavigations);

  await fill(searchBox(), '');

  await expectPageToHaveURL('/');
  await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Comment archive' }));
});

test('typing keeps the active forum filter', async ({ page }) => {
  void page;
  await gotoURL('/search?forum=1');

  await fill(searchBox(), 'AAPL');

  await expectPageToHaveURL('/search?q=AAPL&forum=1');
  await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Search results' }));
  await expectElementToBeVisible(getLocatorByText('Search: AAPL'));
  await expectElementToBeVisible(getLocatorByText('Forum: LIHKG'));
});
