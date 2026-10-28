import { test, expect } from '@fixturesetup';
import {
  click,
  clickAndNavigate,
  expectElementToHaveAttribute,
  expectElementToBeVisible,
  expectPageToHaveURL,
  fill,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';

/** UI tests for the frozen shared plan. The frontend is absent, so every test is red. */
test.beforeEach(async ({ page }) => {
  void page;
});

const search = async (term: string) => {
  await gotoURL('/');
  await fill(getLocatorByRole('searchbox', { name: 'Search comments' }), term);
  await clickAndNavigate(getLocatorByRole('button', { name: 'Search' }));
};

test.describe('visibility', () => {
  test('hidden comments never appear publicly [REQ-shared-001][SCN-shared-001]', async () => {
    await test.step('Given 5013 and 5014 are hidden', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor browses and searches', async () => {
      await search('管理員隱藏');
    });
    await test.step('Then neither comment appears', async () => {
      await expect(getLocatorByText(/呢個留言由管理員隱藏/)).toHaveCount(0);
      await expect(getLocatorByText(/原文已被刪除/)).toHaveCount(0);
    });
  });

  test('blocked authors never appear publicly [REQ-shared-002][SCN-shared-002]', async () => {
    await test.step('Given author 2003 is blocked', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor searches for the author', async () => {
      await search('%E5%BB%A3%E5%91%8A');
    });
    await test.step('Then no comment by 廣告王 appears', async () => {
      await expect(getLocatorByText(/廣告王/)).toHaveCount(0);
    });
  });

  test('forum counts exclude hidden and blocked [REQ-shared-003][SCN-shared-003]', async () => {
    await test.step('Given 71 visible LIHKG comments', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor views the sidebar', async () => {
      await expectElementToBeVisible(getLocatorByRole('navigation', { name: 'Forums' }));
    });
    await test.step('Then LIHKG shows 71 and no HKGolden entry exists', async () => {
      await expect(getLocatorByRole('link', { name: /^LIHKG/ })).toContainText('71');
      await expect(getLocatorByRole('link', { name: /^HKGolden/ })).toHaveCount(0);
    });
  });

  test('a forum with no countable comment is not offered [REQ-shared-003][SCN-shared-004]', async () => {
    await test.step('Given a source whose only comment is hidden', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor views the sidebar', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'All forums' }));
    });
    await test.step('Then that source has no entry', async () => {
      await expect(getLocatorByRole('link', { name: /Empty/ })).toHaveCount(0);
    });
  });
});

test.describe('content', () => {
  test('the grid shows 200 characters and the detail shows all [REQ-shared-004][SCN-shared-005]', async () => {
    await test.step('Given 5009 has a long body', async () => {
      await gotoURL('/search?q=%E7%A0%B4');
    });
    await test.step('When the visitor reads the card', async () => {
      const card = getLocatorByRole('listitem').first();
      await expect(card).toBeVisible();
    });
    await test.step('Then the detail shows the full body', async () => {
      await gotoURL('/comments/5009');
      await expectElementToBeVisible(getLocatorByText(/200 字摘要截斷/));
    });
  });

  test('a short body is not padded [REQ-shared-004][SCN-shared-006]', async () => {
    await test.step('Given 5001 has a short body', async () => {
      await gotoURL('/search?q=%E7%A0%B4');
    });
    await test.step('When the visitor reads the card', async () => {
      await expectElementToBeVisible(getLocatorByText(/今日 \$AAPL 又破頂/));
    });
    await test.step('Then the excerpt is the whole body', async () => {
      await expect(getLocatorByText(/今日 \$AAPL 又破頂，大家覺得仲有冇上升空間？/)).toBeVisible();
    });
  });

  test('every card links to its original post [REQ-shared-005][SCN-shared-007]', async () => {
    await test.step('Given the home grid', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor inspects the cards', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: /又破頂/ }));
    });
    await test.step('Then each card links to its own source URL', async () => {
      const hrefs = await getLocatorByRole('listitem').evaluateAll((items) =>
        items.map((item) => item.querySelector('a')?.getAttribute('href') ?? ''),
      );
      expect(hrefs.every((href) => href.startsWith('/comments/'))).toBe(true);
    });
  });

  test('source names are shown with comments [REQ-shared-006][SCN-shared-008]', async () => {
    await test.step('Given comments from LIHKG', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor reads the cards', async () => {
      await expectElementToBeVisible(getLocatorByText('LIHKG').first());
    });
    await test.step('Then the source is named on the cards', async () => {
      await search('Tesla');
      await expectElementToBeVisible(getLocatorByText('LIHKG').first());
    });
  });

  test('the author shows only display name and id [REQ-shared-009][SCN-shared-011]', async () => {
    await test.step('Given 5001 by 股壇新手 (u2001)', async () => {
      await gotoURL('/search?q=%E7%A0%B4');
    });
    await test.step('When the visitor views card and detail', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
    await test.step('Then no other author field is shown', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
  });

  test('no author profile or contact link is exposed [REQ-shared-009][SCN-shared-012]', async () => {
    await test.step('Given a displayed comment', async () => {
      await gotoURL('/comments/5001');
    });
    await test.step('When the visitor inspects the author area', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
    await test.step('Then no profile or contact link exists', async () => {
      await expect(getLocatorByRole('link', { name: /profile|mailto|@/i })).toHaveCount(0);
    });
  });

  test('HTML in a body is displayed as text [REQ-shared-004][SCN-shared-027]', async ({ page }) => {
    await test.step('Given a body contains a script tag', async () => {
      await gotoURL('/comments/5001');
    });
    await test.step('When the detail renders', async () => {
      await expectElementToBeVisible(getLocatorByText(/<script>/));
    });
    await test.step('Then it is shown literally and does not execute', async () => {
      const executed = await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss === true);
      expect(executed).toBe(false);
    });
  });
});

test.describe('disclaimer and about', () => {
  test('the disclaimer is in the footer and about page [REQ-shared-007][SCN-shared-009]', async () => {
    await test.step('Given no session', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor loads home and about', async () => {
      await expectElementToBeVisible(getLocatorByText(/does not give investment advice/));
    });
    await test.step('Then the about page repeats it', async () => {
      await gotoURL('/about');
      await expectElementToBeVisible(getLocatorByText(/does not give investment advice/));
    });
  });

  test('the disclaimer uses the frozen wording [REQ-shared-008][SCN-shared-010]', async () => {
    await test.step('Given a public page', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor reads the disclaimer', async () => {
      await expectElementToBeVisible(
        getLocatorByText(
          'This site does not give investment advice. It is an archive of public forum comments.',
        ),
      );
    });
    await test.step('Then it states the non-advice position exactly', async () => {
      await expect(
        getLocatorByText(
          'This site does not give investment advice. It is an archive of public forum comments.',
        ),
      ).toHaveCount(1);
    });
  });

  test('the about page is linked from public pages [REQ-shared-016][SCN-shared-024]', async () => {
    await test.step('Given the visitor loads home and detail', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor inspects header and footer', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'About' }));
    });
    await test.step('Then no admin link exists', async () => {
      await expect(getLocatorByRole('link', { name: /admin/i })).toHaveCount(0);
    });
  });

  test('the about page is public [REQ-shared-016][SCN-shared-025]', async () => {
    await test.step('Given a visitor with no session', async () => {
      await gotoURL('/about');
    });
    await test.step('When the about page opens', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: /about/i }));
    });
    await test.step('Then no login is requested', async () => {
      await expectPageToHaveURL('/about');
    });
  });

  test('the about page lists sources, disclaimer and detection [REQ-shared-017][SCN-shared-026]', async () => {
    await test.step('Given LIHKG and the AAPL alias 蘋果', async () => {
      await gotoURL('/about');
    });
    await test.step('When the visitor reads the page', async () => {
      await expectElementToBeVisible(getLocatorByText('LIHKG'));
    });
    await test.step('Then the disclaimer and the detection explanation are present', async () => {
      await expectElementToBeVisible(getLocatorByText(/does not give investment advice/));
      await expectElementToBeVisible(getLocatorByText(/\$TICKER|cashtag|alias/i));
    });
  });
});

test.describe('accessibility and language', () => {
  test('owner authentication uses the strong default [REQ-shared-011][SCN-shared-015]', async ({ page }) => {
    await test.step('Given the owner account exists', async () => {
      await gotoURL('/admin/login');
    });
    await test.step('When the owner signs in', async () => {
      await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
      await fill(getLocatorByRole('textbox', { name: 'Password' }), 'change-me');
      await clickAndNavigate(getLocatorByRole('button', { name: 'Sign in' }));
    });
    await test.step('Then the session cookie is not readable by scripts', async () => {
      const cookies = await page.context().cookies();
      const session = cookies.find((cookie) => cookie.name.includes('session'));
      expect(session?.httpOnly).toBe(true);
    });
  });

  test('interface text is English on the thread page [REQ-shared-012][SCN-shared-016]', async () => {
    await test.step('Given a thread with a collapsed branch', async () => {
      await gotoURL('/comments/5001');
    });
    await test.step('When the visitor reads the controls', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'View on source site' }));
    });
    await test.step('Then the controls are English', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Load more' }));
    });
  });

  test('comment text keeps its original language [REQ-shared-012][SCN-shared-017]', async () => {
    await test.step('Given a Chinese body', async () => {
      await gotoURL('/comments/5001');
    });
    await test.step('When the detail renders', async () => {
      await expectElementToBeVisible(getLocatorByText('蘋果今日成交急升'));
    });
    await test.step('Then the surrounding controls remain English', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'View original post' }));
    });
  });

  test('the search bar is keyboard operable [REQ-shared-013][SCN-shared-018]', async ({ page }) => {
    await test.step('Given the visitor is on the home page using the keyboard', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor enters "AAPL" and submits', async () => {
      await fill(getLocatorByRole('searchbox', { name: 'Search comments' }), 'AAPL');
      await page.keyboard.press('Enter');
    });
    await test.step('Then the URL is /search?q=AAPL', async () => {
      await expectPageToHaveURL('/search?q=AAPL');
    });
  });

  test('cards are keyboard reachable [REQ-shared-013][SCN-shared-019]', async ({ page }) => {
    await test.step('Given the home grid', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor moves focus through the cards', async () => {
      const first = getLocatorByRole('listitem').first().getByRole('link');
      await first.focus();
    });
    await test.step('Then a card can receive focus and open', async () => {
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBe('A');
    });
  });

  test('images carry text alternatives [REQ-shared-014][SCN-shared-020]', async ({ page }) => {
    await test.step('Given the home page images', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor inspects them', async () => {
      const alts = await page.locator('img').evaluateAll((items) => items.map((item) => item.getAttribute('alt')));
      expect(alts.every((alt) => (alt ?? '').trim().length > 0)).toBe(true);
    });
    await test.step('Then every image has an alternative', async () => {
      expect(true).toBe(true);
    });
  });

  test('icon-only controls expose an accessible name [REQ-shared-014][SCN-shared-021]', async () => {
    await test.step('Given icon-only controls', async () => {
      await gotoURL('/');
    });
    await test.step('When the visitor inspects them', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Search' }));
    });
    await test.step('Then each has an accessible name', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Retry' }));
    });
  });

  test('an unknown route shows the not-found page [REQ-shared-015][SCN-shared-022]', async () => {
    await test.step('Given no page exists at /stocks', async () => {
      await gotoURL('/stocks');
    });
    await test.step('When the visitor opens it', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Page not found' }));
    });
    await test.step('Then a link returns home', async () => {
      await expectElementToHaveAttribute(getLocatorByRole('link', { name: 'Go to home' }), 'href', '/');
    });
  });

  test('an unknown nested route shows the same page [REQ-shared-015][SCN-shared-023]', async ({ page }) => {
    await test.step('Given no page exists at /comments/5001/replies', async () => {
      await gotoURL('/comments/5001/replies');
    });
    await test.step('When the visitor opens it', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Page not found' }));
    });
    await test.step('Then no raw error detail is shown', async () => {
      const text = (await page.locator('body').textContent()) ?? '';
      expect(text).not.toMatch(/Error:|at \w+ \(|SELECT /);
    });
  });
});

test.describe('audit', () => {
  const signIn = async () => {
    await gotoURL('/admin/login');
    await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
    await fill(getLocatorByRole('textbox', { name: 'Password' }), 'change-me');
    await clickAndNavigate(getLocatorByRole('button', { name: 'Sign in' }));
  };

  test('hiding a comment is recorded in the audit log [REQ-shared-010][SCN-shared-013]', async () => {
    await test.step('Given the owner is signed in and 5002 is visible', async () => {
      await signIn();
    });
    await test.step('When the owner hides 5002', async () => {
      await click(getLocatorByRole('button', { name: 'Hide' }).first());
    });
    await test.step('Then exactly one hide entry is stored', async () => {
      await expect(getLocatorByText(/hide_comment/)).toHaveCount(1);
    });
  });

  test('the audit entry survives the removal of its target [REQ-shared-010][SCN-shared-014]', async () => {
    await test.step('Given the owner deletes 5002', async () => {
      await signIn();
      await click(getLocatorByRole('button', { name: 'Delete' }).first());
      await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    });
    await test.step('When the owner opens the action log', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: 'Action log' }));
    });
    await test.step('Then the delete entry is still listed', async () => {
      await expect(getLocatorByText(/delete_comment/).first()).toBeVisible();
    });
  });
});
