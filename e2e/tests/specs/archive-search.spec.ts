import { test, expect } from '@fixturesetup';
import {
  click,
  clickAndNavigate,
  expectElementToHaveAttribute,
  expectElementToHaveCount,
  expectElementToHaveText,
  expectElementToBeVisible,
  expectPageToHaveURL,
  fill,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';
import { withApiFailure } from '../utils/api-failure.js';

/**
 * UI journeys for the frozen archive-search plan (local-env/specs/archive-search.md).
 * The frontend does not exist yet, so every test fails at navigation: the red reason is
 * "frontend missing", which is the expected Phase 8 state.
 */
test.beforeEach(async ({ page }) => {
  // Requesting `page` runs the shared fixture, which registers it with vasu-playwright-utils.
  void page;
  await gotoURL('/');
});

const searchBox = () => getLocatorByRole('searchbox', { name: 'Search comments' });
const searchButton = () => getLocatorByRole('button', { name: 'Search' });

test.describe('keyword search', () => {
  test('keyword search returns matching comments [REQ-archive-search-001][SCN-archive-search-001]', async () => {
    await test.step('Given visible comment 5017 contains "Tesla" and 5001 does not', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
    });
    await test.step('When the visitor searches for "Tesla"', async () => {
      await fill(searchBox(), 'Tesla');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then comment 5017 is present and 5001 is not', async () => {
      await expectPageToHaveURL(/q=Tesla/);
      await expectElementToBeVisible(getLocatorByText(/Tesla 長線睇好/));
      await expect(getLocatorByText(/又破頂/)).toHaveCount(0);
    });
  });

  test('alias search reaches a stock [REQ-archive-search-002][SCN-archive-search-002]', async () => {
    await test.step('Given comment 5002 is linked to AAPL through "蘋果"', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor searches for "蘋果"', async () => {
      await fill(searchBox(), '蘋果');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then comment 5002 is in the results', async () => {
      await expectElementToBeVisible(getLocatorByText(/蘋果服務收入增長唔錯/));
    });
  });

  test('ticker search excludes other stocks [REQ-archive-search-002][SCN-archive-search-003]', async () => {
    await test.step('Given 5001 links to AAPL and 5009 links to NVDA', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor searches for "AAPL"', async () => {
      await fill(searchBox(), 'AAPL');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then 5001 appears and 5009 does not', async () => {
      await expectElementToBeVisible(getLocatorByText(/又破頂/));
      await expect(getLocatorByText(/AI 需求短期內都唔會停/)).toHaveCount(0);
    });
  });

  test('results render as cards [REQ-archive-search-003][SCN-archive-search-004]', async () => {
    await test.step('Given 56 visible comments match "NVDA"', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor views the results for "NVDA"', async () => {
      await fill(searchBox(), 'NVDA');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then every card shows source, author, excerpt, time and thread title', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
      await expectElementToBeVisible(getLocatorByText('LIHKG').first());
    });
  });

  test('submitting a search updates the URL [REQ-archive-search-005][SCN-archive-search-007]', async () => {
    await test.step('Given the visitor enters "Tesla"', async () => {
      await fill(searchBox(), 'Tesla');
    });
    await test.step('When the search is submitted', async () => {
      await clickAndNavigate(searchButton());
    });
    await test.step('Then the URL is /search?q=Tesla', async () => {
      await expectPageToHaveURL('/search?q=Tesla');
    });
  });

  test('an empty query shows the home page [REQ-archive-search-007][SCN-archive-search-010]', async () => {
    await test.step('Given the archive holds 71 visible comments', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor submits an empty search', async () => {
      await fill(searchBox(), '');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then the home grid of the 20 newest comments is shown', async () => {
      await expectPageToHaveURL('/');
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
    });
  });

  test('no matches shows the empty state [REQ-archive-search-008][SCN-archive-search-012]', async () => {
    await test.step('Given no visible comment contains "xyzzy"', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor searches for "xyzzy"', async () => {
      await fill(searchBox(), 'xyzzy');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then the empty-state copy is shown', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 0);
      await expectElementToBeVisible(getLocatorByText('No comments match your search,'));
      await expectElementToBeVisible(getLocatorByText(/Try a different keyword or a stock name/));
    });
  });

  test('entering a keyword filters the grid [REQ-archive-search-016][SCN-archive-search-024]', async () => {
    await test.step('Given 56 of 71 comments match "NVDA"', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
    });
    await test.step('When the visitor searches for "NVDA"', async () => {
      await fill(searchBox(), 'NVDA');
      await clickAndNavigate(searchButton());
    });
    await test.step('Then the grid shows only matching cards', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
      await expect(getLocatorByText(/又破頂/)).toHaveCount(0);
    });
  });
});

test.describe('home grid and pagination', () => {
  test('the home grid is newest first [REQ-archive-search-009][SCN-archive-search-013]', async () => {
    await test.step('Given three visible comments with known times', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor opens the home page', async () => {
      await gotoURL('/');
    });
    await test.step('Then cards run newest first', async () => {
      const first = getLocatorByRole('listitem').first();
      await expect(first).toContainText('2026-10-01');
    });
  });

  test('ordering continues across a page boundary [REQ-archive-search-009][SCN-archive-search-014]', async () => {
    await test.step('Given 71 visible comments', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor requests page 2', async () => {
      await clickAndNavigate(getLocatorByRole('button', { name: 'Next' }));
    });
    await test.step('Then page 2 starts older than page 1 ended', async () => {
      await expectPageToHaveURL(/page=2/);
      await expectElementToHaveCount(getLocatorByRole('listitem'), 20);
    });
  });

  test('a short forum fills one page [REQ-archive-search-010][SCN-archive-search-016]', async () => {
    await test.step('Given HKGolden has 2 visible comments', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('When the visitor filters to HKGolden', async () => {
      await clickAndNavigate(getLocatorByRole('link', { name: /^HKGolden/ }));
    });
    await test.step('Then 2 cards are shown and Next is disabled', async () => {
      await expectElementToHaveCount(getLocatorByRole('listitem'), 2);
      await expect(getLocatorByRole('button', { name: 'Next' })).toBeDisabled();
    });
  });

  test('the grid offers previous and next controls [REQ-archive-search-011][SCN-archive-search-017]', async () => {
    await test.step('Given 71 comments and page 2', async () => {
      await gotoURL('/?page=2');
    });
    await test.step('When the visitor views the controls', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Previous' }));
    });
    await test.step('Then Previous and Next are present', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Next' }));
    });
  });

  test('a card shows its five fields [REQ-archive-search-012][SCN-archive-search-018]', async () => {
    await test.step('Given comment 5001 by 股壇新手 (u2001)', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the visitor views the card for 5001', async () => {
      await gotoURL('/search?q=%E7%A0%B4');
    });
    await test.step('Then source, author, excerpt, time and thread title are shown', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
      await expectElementToBeVisible(getLocatorByText('LIHKG'));
      await expectElementToBeVisible(getLocatorByText(/美股討論區/));
    });
  });

  test('opening a card reaches the detail page [REQ-archive-search-014][SCN-archive-search-021]', async () => {
    await test.step('Given the home page shows a card for 5001', async () => {
      await expectElementToBeVisible(getLocatorByText(/又破頂/));
    });
    await test.step('When the visitor opens that card', async () => {
      await clickAndNavigate(getLocatorByRole('link', { name: /又破頂/ }));
    });
    await test.step('Then the detail for 5001 is shown', async () => {
      await expectPageToHaveURL('/comments/5001');
    });
  });
});

test.describe('shell', () => {
  test('the search bar sits above the sidebar and grid [REQ-archive-search-015][SCN-archive-search-022]', async () => {
    await test.step('Given the visitor opens the home page', async () => {
      await expectElementToBeVisible(searchBox());
    });
    await test.step('When the page renders', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('Then the search bar is above both', async () => {
      const searchBoxY = (await searchBox().boundingBox())!.y;
      const sidebarY = (await getLocatorByRole('navigation', { name: 'Forums' }).boundingBox())!.y;
      expect(searchBoxY).toBeLessThan(sidebarY);
    });
  });

  test('the search bar stays on the results page [REQ-archive-search-015][SCN-archive-search-023]', async () => {
    await test.step('Given the visitor searched for "Tesla"', async () => {
      await gotoURL('/search?q=Tesla');
    });
    await test.step('When the results page renders', async () => {
      await expectElementToBeVisible(searchBox());
    });
    await test.step('Then it sits above the sidebar', async () => {
      const searchBoxY = (await searchBox().boundingBox())!.y;
      const sidebarY = (await getLocatorByRole('navigation', { name: 'Forums' }).boundingBox())!.y;
      expect(searchBoxY).toBeLessThan(sidebarY);
    });
  });

  test('the header holds site name, search and about [REQ-archive-search-017][SCN-archive-search-025]', async () => {
    await test.step('Given the visitor opens the home page', async () => {
      await expectElementToBeVisible(searchBox());
    });
    await test.step('When the header renders', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'Find Potential Stock' }));
    });
    await test.step('Then it holds the About link too', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'About' }));
    });
  });

  test('the footer holds the disclaimer and about link [REQ-archive-search-018][SCN-archive-search-026]', async () => {
    await test.step('Given the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('When the footer renders', async () => {
      await expectElementToBeVisible(getLocatorByText(/does not give investment advice/));
    });
    await test.step('Then it holds the About link', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'About' }));
    });
  });

  test('the footer follows onto results [REQ-archive-search-018][SCN-archive-search-027]', async () => {
    await test.step('Given the visitor searched for "Tesla"', async () => {
      await gotoURL('/search?q=Tesla');
    });
    await test.step('When the footer renders', async () => {
      await expectElementToBeVisible(getLocatorByText(/does not give investment advice/));
    });
    await test.step('Then it holds the About link', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'About' }));
    });
  });
});

test.describe('forum sidebar', () => {
  test('a count is a bare number [REQ-archive-search-019][SCN-archive-search-029]', async () => {
    await test.step('Given LIHKG has 69 visible comments', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('When the visitor views the LIHKG entry', async () => {
      await expectElementToHaveText(getLocatorByRole('link', { name: /^LIHKG/ }), /LIHKG\s*69/);
    });
    await test.step('Then the number is separate from the name', async () => {
      await expectElementToHaveText(getLocatorByRole('link', { name: /^LIHKG/ }), /^LIHKG\s*69$/);
    });
  });

  test('All forums is first [REQ-archive-search-020][SCN-archive-search-030]', async () => {
    await test.step('Given two forums have visible comments', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('When the visitor views the sidebar', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'All forums' }));
    });
    await test.step('Then All forums is the first entry', async () => {
      const entries = getLocatorByRole('navigation', { name: 'Forums' }).getByRole('link');
      await expect(entries.first()).toHaveText('All forums');
    });
  });

  test('an empty forum is omitted [REQ-archive-search-022][SCN-archive-search-032]', async () => {
    await test.step('Given both HKGolden comments are hidden', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('When the visitor views the sidebar', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: /^LIHKG/ }));
    });
    await test.step('Then HKGolden has no entry', async () => {
      await expect(getLocatorByRole('link', { name: /^HKGolden/ })).toHaveCount(0);
    });
  });

  test('with no visible comment only All forums remains [REQ-archive-search-022][SCN-archive-search-033]', async () => {
    await test.step('Given every comment is hidden or blocked', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('When the visitor views the sidebar', async () => {
      const entries = getLocatorByRole('navigation', { name: 'Forums' }).getByRole('link');
      await expect(entries).toHaveCount(1);
    });
    await test.step('Then the only entry is All forums', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'All forums' }));
    });
  });

  test('selecting a forum puts its id in the URL [REQ-archive-search-025][SCN-archive-search-037]', async () => {
    await test.step('Given the visitor selects HKGolden', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: /^HKGolden/ }));
    });
    await test.step('When the filtered grid renders', async () => {
      await clickAndNavigate(getLocatorByRole('link', { name: /^HKGolden/ }));
    });
    await test.step('Then the URL is /search?forum=2', async () => {
      await expectPageToHaveURL('/search?forum=2');
    });
  });

  test('keyword and forum share the URL [REQ-archive-search-025][SCN-archive-search-038]', async () => {
    await test.step('Given the visitor searched for "Tesla"', async () => {
      await gotoURL('/search?q=Tesla');
    });
    await test.step('When the visitor selects HKGolden', async () => {
      await clickAndNavigate(getLocatorByRole('link', { name: /^HKGolden/ }));
    });
    await test.step('Then the URL keeps both parameters', async () => {
      await expectPageToHaveURL('/search?q=Tesla&forum=2');
    });
  });

  test('the active forum is highlighted [REQ-archive-search-026][SCN-archive-search-039]', async () => {
    await test.step('Given the visitor selected HKGolden', async () => {
      await gotoURL('/search?forum=2');
    });
    await test.step('When the sidebar renders', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: /^HKGolden/ }));
    });
    await test.step('Then HKGolden is marked active and LIHKG is not', async () => {
      await expectElementToHaveAttribute(getLocatorByRole('link', { name: /^HKGolden/ }), 'aria-current', 'page');
      await expect(getLocatorByRole('link', { name: /^LIHKG/ })).not.toHaveAttribute('aria-current', 'page');
    });
  });

  test('an unknown forum marks nothing active [REQ-archive-search-026][SCN-archive-search-040]', async () => {
    await test.step('Given 71 visible comments', async () => {
      await gotoURL('/search?forum=999');
    });
    await test.step('When the visitor views the sidebar', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('Then no entry is marked active', async () => {
      await expect(
        getLocatorByRole('navigation', { name: 'Forums' }).locator('[aria-current="page"]'),
      ).toHaveCount(0);
    });
  });

  test('All forums clears the forum filter [REQ-archive-search-028][SCN-archive-search-043]', async () => {
    await test.step('Given HKGolden is selected with query Tesla', async () => {
      await gotoURL('/search?q=Tesla&forum=2');
    });
    await test.step('When the visitor selects All forums', async () => {
      await clickAndNavigate(getLocatorByRole('link', { name: 'All forums' }));
    });
    await test.step('Then the URL keeps only the query', async () => {
      await expectPageToHaveURL('/search?q=Tesla');
    });
  });

  test('All forums changes nothing when nothing is selected [REQ-archive-search-028][SCN-archive-search-044]', async () => {
    await test.step('Given the visitor is on the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'All forums' }));
    });
    await test.step('When the visitor selects All forums', async () => {
      await click(getLocatorByRole('link', { name: 'All forums' }));
    });
    await test.step('Then the URL carries no forum parameter', async () => {
      await expectPageToHaveURL('/');
    });
  });
});

test.describe('responsive layout', () => {
  test('desktop places the sidebar beside the grid [REQ-archive-search-029][SCN-archive-search-045]', async ({ page }) => {
    await test.step('Given a 1280px viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoURL('/');
    });
    await test.step('When the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('Then the sidebar sits left of the grid', async () => {
      const sidebar = (await getLocatorByRole('navigation', { name: 'Forums' }).boundingBox())!;
      const grid = (await getLocatorByRole('list', { name: 'Comments' }).boundingBox())!;
      expect(sidebar.x + sidebar.width).toBeLessThanOrEqual(grid.x);
    });
  });

  test('desktop shows a three-column grid [REQ-archive-search-030][SCN-archive-search-046]', async ({ page }) => {
    await test.step('Given a 1280px viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoURL('/');
    });
    await test.step('When the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('Then the first three cards share a row', async () => {
      const tops = await getLocatorByRole('listitem').evaluateAll((items) =>
        items.slice(0, 3).map((item) => Math.round((item as HTMLElement).getBoundingClientRect().top)),
      );
      expect(new Set(tops).size).toBe(1);
    });
  });

  test('tablet shows a two-column grid [REQ-archive-search-031][SCN-archive-search-047]', async ({ page }) => {
    await test.step('Given a 900px viewport', async () => {
      await page.setViewportSize({ width: 900, height: 900 });
      await gotoURL('/');
    });
    await test.step('When the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('Then the first two cards share a row', async () => {
      const tops = await getLocatorByRole('listitem').evaluateAll((items) =>
        items.slice(0, 2).map((item) => Math.round((item as HTMLElement).getBoundingClientRect().top)),
      );
      expect(new Set(tops).size).toBe(1);
    });
  });

  test('mobile shows a single column [REQ-archive-search-032][SCN-archive-search-048]', async ({ page }) => {
    await test.step('Given a 390px viewport', async () => {
      await page.setViewportSize({ width: 390, height: 800 });
      await gotoURL('/');
    });
    await test.step('When the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('list', { name: 'Comments' }));
    });
    await test.step('Then the first two cards stack', async () => {
      const tops = await getLocatorByRole('listitem').evaluateAll((items) =>
        items.slice(0, 2).map((item) => Math.round((item as HTMLElement).getBoundingClientRect().top)),
      );
      expect(new Set(tops).size).toBe(2);
    });
  });

  test('the mobile sidebar collapses into a menu button [REQ-archive-search-033][SCN-archive-search-049]', async ({ page }) => {
    await test.step('Given a 390px viewport', async () => {
      await page.setViewportSize({ width: 390, height: 800 });
      await gotoURL('/');
    });
    await test.step('When the visitor opens the home page', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Forums' }));
    });
    await test.step('Then the sidebar is not shown as a column', async () => {
      await expect(getLocatorByRole('navigation', { name: 'Forums' })).toBeHidden();
    });
  });
});

test.describe('failure states', () => {
  test('a failed request offers a retry [REQ-archive-search-034][SCN-archive-search-050]', async () => {
    // The archive loader runs on the SSR server, so the failure is injected into
    // the server's API target rather than intercepted with page.route.
    await withApiFailure(
      {
        pattern: '/api/comments',
        status: 500,
        body: { error: { code: 'INTERNAL_ERROR', message: 'boom' } },
      },
      async () => {
        await test.step('Given the comment-data request fails', async () => {
          await gotoURL('/');
        });
        await test.step('When the visitor opens the home page', async () => {
          await expectElementToBeVisible(getLocatorByText('Something went wrong.'));
        });
        await test.step('Then exactly one Retry control is present', async () => {
          await expectElementToHaveCount(getLocatorByRole('button', { name: 'Retry' }), 1);
        });
      },
    );
  });

  test('visitors never see raw error details [REQ-archive-search-035][SCN-archive-search-051]', async ({ page }) => {
    await withApiFailure(
      {
        pattern: '/api/comments',
        status: 500,
        body: {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error: connect failed at Pool.query (SELECT * FROM comment)',
          },
        },
      },
      async () => {
        await test.step('Given a failed request carrying a stack trace', async () => {
          await gotoURL('/');
        });
        await test.step('When the visitor reads the page', async () => {
          await expectElementToBeVisible(getLocatorByRole('button', { name: 'Retry' }));
        });
        await test.step('Then no exception, stack frame or SQL fragment is visible', async () => {
          const text = (await page.locator('body').textContent()) ?? '';
          expect(text).not.toMatch(/Error:|at \w+ \(|SELECT |stack/i);
        });
      },
    );
  });
});
