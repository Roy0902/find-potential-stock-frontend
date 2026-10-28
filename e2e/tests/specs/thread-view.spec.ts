import { test, expect } from '@fixturesetup';
import {
  click,
  expectElementToHaveAttribute,
  expectElementToBeVisible,
  expectPageToHaveURL,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';

/** UI tests for the frozen thread-view plan. The frontend is absent, so every test is red. */
test.beforeEach(async ({ page }) => {
  void page;
});

const openThread = (id: number) => gotoURL(`/comments/${id}`);
const article = (name: string | RegExp) => getLocatorByRole('article', { name });

test.describe('thread header', () => {
  test('a visitor opens a comment detail without signing in [REQ-thread-view-001][SCN-thread-view-001]', async () => {
    await test.step('Given thread 1001 contains comment 5001', async () => {
      await openThread(5001);
    });
    await test.step('When a visitor opens the detail', async () => {
      await expectPageToHaveURL('/comments/5001');
    });
    await test.step('Then the header and tree are served with no login', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
  });

  test('the header names thread and source [REQ-thread-view-002][SCN-thread-view-002]', async () => {
    await test.step('Given thread 1001 on LIHKG', async () => {
      await openThread(5001);
    });
    await test.step('When the visitor opens the detail', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: /美股討論區/ }));
    });
    await test.step('Then the source name is shown', async () => {
      await expectElementToBeVisible(getLocatorByText('LIHKG').first());
    });
  });

  test('the header links to the source thread [REQ-thread-view-003][SCN-thread-view-003]', async () => {
    await test.step('Given thread 1001 has a source URL', async () => {
      await openThread(5001);
    });
    await test.step('When the header renders', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'View thread on source site' }));
    });
    await test.step('Then the link targets the source thread', async () => {
      await expectElementToHaveAttribute(
        getLocatorByRole('link', { name: 'View thread on source site' }),
        'href',
        'https://lihkg.com/thread/1001',
      );
    });
  });
});

test.describe('reply tree', () => {
  test('replies are indented under their parent [REQ-thread-view-004][SCN-thread-view-004]', async () => {
    await test.step('Given 5002 answers 5001 and 5003 answers 5002', async () => {
      await openThread(5001);
    });
    await test.step('When the visitor reads the tree', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then each reply is further indented than its parent', async () => {
      const parent = (await article(/股壇新手/).first().boundingBox())!;
      const reply = (await article(/長線投資者/).first().boundingBox())!;
      expect(reply.x).toBeGreaterThan(parent.x);
    });
  });

  test('the opened comment is highlighted [REQ-thread-view-005][SCN-thread-view-005]', async () => {
    await test.step('Given comment 5003 is a reply', async () => {
      await openThread(5003);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(article(/技術分析師/).first());
    });
    await test.step('Then 5003 is marked as current', async () => {
      await expect(article(/技術分析師/).first()).toHaveAttribute('aria-current', 'true');
    });
  });

  test('the author shows display name and id [REQ-thread-view-006][SCN-thread-view-006]', async () => {
    await test.step('Given comment 5001 by 股壇新手 (u2001)', async () => {
      await openThread(5001);
    });
    await test.step('When the comment renders', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
    await test.step('Then the braces and id are present', async () => {
      await expectElementToBeVisible(getLocatorByText('{股壇新手(u2001)}'));
    });
  });

  test('each comment shows its posted time [REQ-thread-view-007][SCN-thread-view-007]', async () => {
    await test.step('Given 5001 posted 2026-10-01T00:10:00Z', async () => {
      await openThread(5001);
    });
    await test.step('When the comment renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then it shows a 2026-10-01 time', async () => {
      await expect(article(/股壇新手/)).toContainText('2026-10-01');
    });
  });

  test('the full body is shown [REQ-thread-view-008][SCN-thread-view-008]', async () => {
    await test.step('Given 5009 has a body over 200 characters', async () => {
      await openThread(5009);
    });
    await test.step('When the detail renders', async () => {
      await expectElementToBeVisible(article(/長線投資者/));
    });
    await test.step('Then text after character 200 is present', async () => {
      await expect(article(/長線投資者/)).toContainText('200 字摘要截斷');
    });
  });

  test('every comment links to its own post [REQ-thread-view-009][SCN-thread-view-009]', async () => {
    await test.step('Given 5001, 5002 and 5015 have distinct URLs', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      const links = getLocatorByRole('link', { name: 'View original post' });
      await expect(links.first()).toBeVisible();
    });
    await test.step('Then each links to its own source URL', async () => {
      const hrefs = await getLocatorByRole('link', { name: 'View original post' }).evaluateAll((items) =>
        items.map((item) => item.getAttribute('href')),
      );
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });
  });

  test('five nested levels are displayed [REQ-thread-view-010][SCN-thread-view-010]', async () => {
    await test.step('Given the chain 5001-5002-5005-5006-5007', async () => {
      await openThread(5001);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(article(/散戶甲/).first());
    });
    await test.step('Then all five bodies are visible', async () => {
      const bodies = [
        '今日 $AAPL 又破頂',
        '蘋果服務收入增長唔錯',
        '我都係分段買入',
        '咁你平均成本幾多',
        '我大約 180 左右',
      ];
      for (const body of bodies) await expectElementToBeVisible(getLocatorByText(new RegExp(body)));
    });
  });

  test('deeper replies stay collapsed [REQ-thread-view-011][SCN-thread-view-011]', async () => {
    await test.step('Given the chain continues to 5008', async () => {
      await openThread(5001);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(getLocatorByText(/我 165/));
    });
    await test.step('Then 5008 is not displayed', async () => {
      await expect(getLocatorByText(/我 165/)).toHaveCount(0);
    });
  });

  test('a collapsed branch links to the source [REQ-thread-view-012][SCN-thread-view-012]', async () => {
    await test.step('Given a branch descends past level five', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: 'View on source site' }));
    });
    await test.step('Then no body from that branch is shown', async () => {
      await expect(getLocatorByText(/我 165/)).toHaveCount(0);
    });
  });

  test('a reply to an uncollected parent is top level [REQ-thread-view-013][SCN-thread-view-013]', async () => {
    await test.step('Given 5010 names an uncollected parent', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(getLocatorByText(/同意上面師兄講嘅風險管理/));
    });
    await test.step('Then it has top-level indentation', async () => {
      const top = (await article(/股壇新手/).first().boundingBox())!;
      const orphan = (await article(/技術分析師/).filter({ hasText: '同意上面師兄' }).boundingBox())!;
      expect(Math.round(orphan.x)).toBe(Math.round(top.x));
    });
  });

  test('that reply is labelled [REQ-thread-view-014][SCN-thread-view-014]', async () => {
    await test.step('Given 5010 has an uncollected parent', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(getLocatorByText('Replying to an earlier comment,'));
    });
    await test.step('Then only that reply carries the label', async () => {
      await expect(getLocatorByText('Replying to an earlier comment,')).toHaveCount(1);
    });
  });

  test('a blocked author is removed from the tree [REQ-thread-view-015][SCN-thread-view-015]', async () => {
    await test.step('Given author 2003 is blocked', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then no comment by 廣告王 is shown', async () => {
      await expect(getLocatorByText('{廣告王(u2003)}')).toHaveCount(0);
    });
  });

  test('replies of a removed comment move up [REQ-thread-view-016][SCN-thread-view-016]', async () => {
    await test.step('Given a visible reply answers blocked comment 5004', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then the reply sits under the nearest visible ancestor', async () => {
      await expectElementToBeVisible(getLocatorByText(/回覆廣告留言/));
    });
  });
});

test.describe('paging', () => {
  test('a thread shows 50 top-level comments [REQ-thread-view-017][SCN-thread-view-017]', async () => {
    await test.step('Given thread 1002 holds 55 top-level comments', async () => {
      await openThread(6000);
    });
    await test.step('When the thread opens', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Load more' }));
    });
    await test.step('Then 50 top-level comments are rendered', async () => {
      await expect(getLocatorByRole('article')).toHaveCount(50);
    });
  });

  test('the thread offers Load more [REQ-thread-view-018][SCN-thread-view-018]', async () => {
    await test.step('Given 55 top-level comments with 50 shown', async () => {
      await openThread(6000);
    });
    await test.step('When the visitor reaches the end', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Load more' }));
    });
    await test.step('Then the control is present', async () => {
      await expectElementToBeVisible(getLocatorByRole('button', { name: 'Load more' }));
    });
  });

  test('Load more appends the rest [REQ-thread-view-019][SCN-thread-view-019]', async () => {
    await test.step('Given 50 of 55 are shown', async () => {
      await openThread(6000);
    });
    await test.step('When the visitor loads more', async () => {
      await click(getLocatorByRole('button', { name: 'Load more' }));
    });
    await test.step('Then all 55 top-level comments are shown', async () => {
      await expect(getLocatorByRole('article')).toHaveCount(55);
    });
  });

  test('Load more disappears when exhausted [REQ-thread-view-020][SCN-thread-view-020]', async () => {
    await test.step('Given every top-level comment is loaded', async () => {
      await openThread(6000);
      await click(getLocatorByRole('button', { name: 'Load more' }));
    });
    await test.step('When the visitor reaches the end', async () => {
      await expect(getLocatorByRole('article')).toHaveCount(55);
    });
    await test.step('Then Load more is absent', async () => {
      await expect(getLocatorByRole('button', { name: 'Load more' })).toHaveCount(0);
    });
  });

  test('siblings are ordered by posted time [REQ-thread-view-021][SCN-thread-view-021]', async () => {
    await test.step('Given replies posted 09:05, 10:15 and 11:40', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      const texts = await getLocatorByRole('article').allTextContents();
      expect(texts.length).toBeGreaterThan(0);
    });
    await test.step('Then they appear in posted order', async () => {
      const times = await getLocatorByRole('article').evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-posted-at') ?? ''),
      );
      expect([...times].sort()).toEqual(times);
    });
  });

  test('equal posted times keep a stable order [REQ-thread-view-022][SCN-thread-view-022]', async () => {
    await test.step('Given two replies posted at the same instant', async () => {
      await openThread(5001);
    });
    await test.step('When the thread is opened twice', async () => {
      await openThread(5001);
    });
    await test.step('Then their order is identical', async () => {
      const first = await getLocatorByRole('article').allTextContents();
      await gotoURL('/comments/5001');
      const second = await getLocatorByRole('article').allTextContents();
      expect(first).toEqual(second);
    });
  });
});

test.describe('layout, language and errors', () => {
  test('desktop uses full indentation [REQ-thread-view-023][SCN-thread-view-023]', async ({ page }) => {
    await test.step('Given a desktop viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then nested replies are indented', async () => {
      const parent = (await article(/股壇新手/).first().boundingBox())!;
      const child = (await article(/長線投資者/).first().boundingBox())!;
      expect(child.x).toBeGreaterThan(parent.x);
    });
  });

  test('mobile reduces the indentation [REQ-thread-view-024][SCN-thread-view-024]', async ({ page }) => {
    await test.step('Given a 390px viewport', async () => {
      await page.setViewportSize({ width: 390, height: 800 });
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then the indent is smaller than on desktop', async () => {
      const parent = (await article(/股壇新手/).first().boundingBox())!;
      const child = (await article(/長線投資者/).first().boundingBox())!;
      expect(child.x - parent.x).toBeLessThan(48);
    });
  });

  test('a known language sets lang [REQ-thread-view-025][SCN-thread-view-025]', async () => {
    await test.step('Given 5001 has language zh-HK', async () => {
      await openThread(5001);
    });
    await test.step('When the body renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then the body carries lang="zh-HK"', async () => {
      await expect(article(/股壇新手/).locator('[lang]').first()).toHaveAttribute('lang', 'zh-HK');
    });
  });

  test('an unknown language omits lang [REQ-thread-view-025][SCN-thread-view-026]', async () => {
    await test.step('Given a comment without a stored language', async () => {
      await openThread(5001);
    });
    await test.step('When the body renders', async () => {
      await expectElementToBeVisible(article(/股壇新手/));
    });
    await test.step('Then no lang attribute is present', async () => {
      await expect(article(/股壇新手/).locator('[lang]')).toHaveCount(0);
    });
  });

  test('a missing comment shows the unavailable message [REQ-thread-view-026][SCN-thread-view-027]', async () => {
    await test.step('Given no comment exists with that id', async () => {
      await openThread(999999);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
    await test.step('Then no tree is rendered', async () => {
      await expect(getLocatorByRole('article')).toHaveCount(0);
    });
  });

  test('a hidden comment shows the unavailable message [REQ-shared-001][SCN-thread-view-028]', async () => {
    await test.step('Given 5013 is hidden', async () => {
      await openThread(5013);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
    await test.step('Then its body is not shown', async () => {
      await expect(getLocatorByText('呢個留言由管理員隱藏')).toHaveCount(0);
    });
  });

  test('the unavailable message links to a known source [REQ-thread-view-027][SCN-thread-view-029]', async () => {
    await test.step('Given 5013 is hidden but stored', async () => {
      await openThread(5013);
    });
    await test.step('When the message renders', async () => {
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
    await test.step('Then it links to the source URL', async () => {
      await expectElementToBeVisible(getLocatorByRole('link', { name: /View original post/ }));
    });
  });

  test('no source link is shown for an unknown id [REQ-thread-view-027][SCN-thread-view-030]', async () => {
    await test.step('Given an id with no known source', async () => {
      await openThread(999999);
    });
    await test.step('When the message renders', async () => {
      await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
    });
    await test.step('Then it contains no source link', async () => {
      await expect(getLocatorByRole('link', { name: /source|original/i })).toHaveCount(0);
    });
  });

  test('a thread of only non-visible comments renders its header [REQ-thread-view-001][SCN-thread-view-031]', async () => {
    await test.step('Given every comment in thread 1001 is non-visible', async () => {
      await openThread(5001);
    });
    await test.step('When the detail opens', async () => {
      await expectElementToBeVisible(getLocatorByRole('heading', { name: /美股討論區/ }));
    });
    await test.step('Then the comment list is empty', async () => {
      await expect(getLocatorByRole('article')).toHaveCount(0);
    });
  });

  test('an unidentified reply target is labelled [REQ-thread-view-014][SCN-thread-view-032]', async () => {
    await test.step('Given 5011 has an unidentified reply target', async () => {
      await openThread(5001);
    });
    await test.step('When the tree renders', async () => {
      await expectElementToBeVisible(getLocatorByText(/唔記得覆邊個/));
    });
    await test.step('Then it carries the label and its own source link', async () => {
      const node = article(/股壇新手/).filter({ hasText: '唔記得覆邊個' });
      await expect(node).toContainText('Replying to an earlier comment,');
      await expect(node.getByRole('link', { name: 'View original post' })).toBeVisible();
    });
  });
});
