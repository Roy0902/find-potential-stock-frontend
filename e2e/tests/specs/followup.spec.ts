import { execSync } from 'node:child_process';
import { test, expect } from '@fixturesetup';
import {
  click,
  clickAndNavigate,
  expectElementToBeVisible,
  expectPageToHaveURL,
  fill,
  getLocatorByRole,
  getLocatorByText,
  gotoURL,
} from 'vasu-playwright-utils';
import { withDb } from '../utils/db.js';
import { withApiFailure } from '../utils/api-failure.js';

/** Replacement tests for the 49 scenarios blocked in 10-verification/report.md. */

test.beforeEach(async ({ page }) => {
  void page;
});

const grid = () => getLocatorByRole('list', { name: 'Comments' });
const cards = () => grid().getByRole('listitem');
const articleWith = (text: string) => getLocatorByRole('article').filter({ hasText: text });
const articleOf = (body: string) =>
  getLocatorByText(body).first().locator('xpath=ancestor::article[1]');

async function setHidden(ids: number[], hidden: boolean) {
  await withDb((client) =>
    client.query(
      `UPDATE comment
          SET is_hidden = $2,
              hidden_reason = CASE WHEN $2 THEN 'admin' ELSE NULL END
        WHERE id = ANY($1)`,
      [ids, hidden],
    ),
  );
}

async function withHidden<T>(ids: number[], work: () => Promise<T>): Promise<T> {
  await setHidden(ids, true);
  try {
    return await work();
  } finally {
    await setHidden(ids, false);
  }
}

const FIXTURE = { source: 9960, thread: 9960, author: 9960 };

async function cleanupFixture() {
  await withDb(async (client) => {
    await client.query('DELETE FROM comment WHERE source_id = $1', [FIXTURE.source]);
    await client.query('DELETE FROM thread WHERE source_id = $1', [FIXTURE.source]);
    await client.query('DELETE FROM author WHERE source_id = $1', [FIXTURE.source]);
    await client.query('DELETE FROM source WHERE id = $1', [FIXTURE.source]);
  });
}

async function seedFixture(options: {
  id: number;
  body: string;
  lang: string | null;
  hidden: boolean;
}): Promise<number> {
  await cleanupFixture();
  await withDb(async (client) => {
    await client.query(
      "INSERT INTO source (id, name, base_url, enabled) VALUES ($1, 'Followup fixture', 'https://fixture.test', false)",
      [FIXTURE.source],
    );
    await client.query(
      "INSERT INTO thread (id, source_id, external_id, title, url, first_seen_at) VALUES ($1, $1, 't', 'Followup thread', 'https://fixture.test/t', now())",
      [FIXTURE.thread],
    );
    await client.query(
      "INSERT INTO author (id, source_id, external_id, display_name) VALUES ($1, $1, 'a', 'Fixture Author')",
      [FIXTURE.author],
    );
    await client.query(
      `INSERT INTO comment (id, source_id, thread_id, author_id, external_id, body, posted_at, url, lang, is_hidden, hidden_reason, first_seen_at, last_seen_at)
       VALUES ($1, $2, $2, $2, 'fixture-c', $3, '2026-10-02T00:00:00Z', 'https://fixture.test/c/1', $4, $5, CASE WHEN $5 THEN 'admin' ELSE NULL END, now(), now())`,
      [options.id, FIXTURE.source, options.body, options.lang, options.hidden],
    );
  });
  return options.id;
}

async function signIn() {
  await gotoURL('/admin/login');
  await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
  await fill(getLocatorByRole('textbox', { name: 'Password' }), 'change-me');
  await clickAndNavigate(getLocatorByRole('button', { name: 'Sign in' }));
  await expectPageToHaveURL('/admin');
}

const adminRow = (text: string) =>
  getLocatorByRole('list', { name: 'Admin comments' })
    .getByRole('listitem')
    .filter({ hasText: text });

const adminSearch = async (term: string) => {
  await fill(getLocatorByRole('searchbox', { name: 'Search comments' }), term);
  await click(getLocatorByRole('button', { name: 'Search' }));
};

test.describe('archive-search follow-up', () => {
  test('a card carries title, author, source, excerpt and time [SCN-followup-001]', async () => {
    await gotoURL('/');
    const card = cards().first();
    await expect(card).toContainText('LIHKG');
    await expect(card).toContainText(/[{}].+\(.+\)/);
    await expect(card).toContainText('2026-10-01');
    await expect(card).toContainText('半導體股集中討論');
  });

  test('a searched card opens its detail [SCN-followup-002]', async () => {
    await gotoURL('/search?q=%E7%A0%B4');
    await clickAndNavigate(cards().first().getByRole('link'));
    await expectPageToHaveURL('/comments/5001');
  });

  test('a forum with no visible comment is omitted [SCN-followup-003]', async () => {
    await gotoURL('/');
    await expect(getLocatorByRole('navigation', { name: 'Forums' })).toBeVisible();
    await expect(getLocatorByRole('link', { name: /^LIHKG/ })).toBeVisible();
    await expect(getLocatorByRole('link', { name: /^EmptyForum/ })).toHaveCount(0);
  });

  test('with every comment hidden only All forums remains [SCN-followup-004]', async () => {
    const visible = await withDb(async (client) => {
      const result = await client.query<{ id: number }>(
        `SELECT c.id FROM comment c JOIN author a ON a.id = c.author_id
          WHERE c.is_hidden = false AND a.is_blocked = false`,
      );
      return result.rows.map((row) => row.id);
    });
    await withHidden(visible, async () => {
      await gotoURL('/');
      const links = getLocatorByRole('navigation', { name: 'Forums' }).getByRole('link');
      await expect(links).toHaveCount(1);
      await expect(links.first()).toHaveText('All forums');
    });
  });
});

test.describe('thread-view follow-up', () => {
  test('a comment detail renders without login [SCN-followup-005]', async () => {
    await gotoURL('/comments/5001');
    await expect(getLocatorByRole('article').first()).toBeVisible();
  });

  test('replies are indented under their parent [SCN-followup-006]', async () => {
    await gotoURL('/comments/5001');
    const parent = (await articleOf('今日 $AAPL 又破頂').boundingBox())!;
    const reply = (await articleOf('蘋果服務收入增長唔錯').boundingBox())!;
    const grandchild = (await articleOf('同意，不過要留意市盈率').boundingBox())!;
    expect(reply.x).toBeGreaterThan(parent.x);
    expect(grandchild.x).toBeGreaterThan(reply.x);
  });

  test('the author shows name and id [SCN-followup-007]', async () => {
    await gotoURL('/comments/5001');
    await expect(getLocatorByRole('article').first()).toContainText('{股壇新手(u2001)}');
  });

  test('each comment shows its posted time [SCN-followup-008]', async () => {
    await gotoURL('/comments/5001');
    await expect(getLocatorByRole('article').first()).toContainText('2026-10-01');
  });

  test('the detail shows the full body [SCN-followup-009]', async () => {
    await gotoURL('/comments/5009');
    await expect(articleWith('200 字摘要截斷')).toBeVisible();
  });

  test('five nested levels are displayed [SCN-followup-010]', async () => {
    await gotoURL('/comments/5001');
    for (const text of [
      '今日 $AAPL 又破頂',
      '蘋果服務收入增長唔錯',
      '我都係分段買入',
      '咁你平均成本幾多',
      '我大約 180 左右',
    ]) {
      await expect(articleWith(text).first()).toBeVisible();
    }
  });

  test('replies below the cap stay collapsed [SCN-followup-011]', async () => {
    await gotoURL('/comments/5001');
    await expect(getLocatorByText('我 165')).toHaveCount(0);
    await expect(getLocatorByRole('link', { name: 'View on source site' }).first()).toBeVisible();
  });

  test('an uncollected parent is labelled [SCN-followup-012]', async () => {
    await gotoURL('/comments/5001');
    await expect(articleWith('同意上面師兄講嘅風險管理')).toContainText(
      'Replying to an earlier comment,',
    );
  });

  test('a blocked author is removed from the tree [SCN-followup-013]', async () => {
    await gotoURL('/comments/5001');
    await expect(getLocatorByRole('article', { name: /廣告王/ })).toHaveCount(0);
  });

  test('replies of a removed comment move to the visible parent [SCN-followup-014]', async () => {
    await withHidden([5002], async () => {
      await gotoURL('/comments/5001');
      const root = articleWith('今日 $AAPL 又破頂').first();
      await expect(root.locator('article').filter({ hasText: '我都係分段買入' })).toHaveCount(1);
    });
  });

  test('siblings are ordered by posted time [SCN-followup-015]', async () => {
    await gotoURL('/comments/5001');
    const parent = articleWith('蘋果服務收入增長唔錯').first();
    const children = parent.locator('article');
    await expect(children.first()).toContainText('同意，不過要留意市盈率');
  });

  test('desktop keeps full indentation [SCN-followup-016]', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoURL('/comments/5001');
    const parent = (await articleOf('今日 $AAPL 又破頂').boundingBox())!;
    const reply = (await articleOf('蘋果服務收入增長唔錯').boundingBox())!;
    expect(reply.x - parent.x).toBeGreaterThanOrEqual(16);
  });

  test('mobile reduces the indentation [SCN-followup-017]', async ({ page }) => {
    const indentAt = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await gotoURL('/comments/5001');
      const parent = (await articleOf('今日 $AAPL 又破頂').boundingBox())!;
      const reply = (await articleOf('蘋果服務收入增長唔錯').boundingBox())!;
      return reply.x - parent.x;
    };

    const desktop = await indentAt(1280, 900);
    const mobile = await indentAt(390, 800);

    expect(mobile).toBeLessThan(desktop);
  });

  test('a known language sets lang [SCN-followup-018]', async () => {
    await gotoURL('/comments/5001');
    await expect(articleOf('今日 $AAPL 又破頂').locator('p[lang]').first()).toHaveAttribute(
      'lang',
      'zh-HK',
    );
  });

  test('an unknown language omits lang [SCN-followup-019]', async () => {
    await seedFixture({ id: 9961, body: 'No language comment', lang: null, hidden: false });
    try {
      await gotoURL('/comments/9961');
      const article = getLocatorByRole('article').first();
      await expect(article).toContainText('No language comment');
      await expect(article.locator('[lang]')).toHaveCount(0);
    } finally {
      await cleanupFixture();
    }
  });

  test('a thread with no visible comment has an empty tree [SCN-followup-020]', async () => {
    await seedFixture({ id: 9962, body: 'Hidden only', lang: 'en', hidden: true });
    try {
      const response = await fetch(
        `${process.env.API_URL ?? 'http://localhost:3000'}/api/threads/9960`,
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.thread.title).toBe('Followup thread');
      expect(body.comments).toEqual([]);
    } finally {
      await cleanupFixture();
    }
  });
});

test.describe('shared follow-up', () => {
  test('every card links to a comment detail [SCN-followup-021]', async () => {
    await gotoURL('/');
    const hrefs = await cards().evaluateAll((items) =>
      items.map((item) => item.querySelector('a')?.getAttribute('href') ?? ''),
    );
    expect(hrefs.length).toBe(20);
    expect(hrefs.every((href) => /^\/comments\/\d+$/.test(href))).toBe(true);
  });

  test('only the display name and id are shown [SCN-followup-022]', async () => {
    await gotoURL('/comments/5001');
    const article = getLocatorByRole('article').first();
    await expect(article).toContainText('{股壇新手(u2001)}');
    await expect(article.getByRole('link', { name: /profile|mailto|@/i })).toHaveCount(0);
  });

  test('a long thread offers Load more in English [SCN-followup-023]', async () => {
    await gotoURL('/comments/6000');
    await expect(getLocatorByRole('button', { name: 'Load more' })).toBeVisible();
    await expect(getLocatorByRole('link', { name: 'View original post' }).first()).toBeVisible();
  });

  test('comment text keeps its language [SCN-followup-024]', async () => {
    await gotoURL('/comments/5002');
    await expect(getLocatorByText('蘋果服務收入增長唔錯，長線可以繼續持有。')).toBeVisible();
    await expect(getLocatorByRole('link', { name: 'View original post' }).first()).toBeVisible();
  });

  test('a failed request offers Retry [SCN-followup-025]', async () => {
    // The archive loader runs on the SSR server, so failure injection happens at
    // the server's API target instead of through page.route.
    await withApiFailure({ pattern: '/api/comments', status: 503 }, async () => {
      await gotoURL('/');
      await expectElementToBeVisible(getLocatorByText('Something went wrong.'));
      await expect(getLocatorByRole('button', { name: 'Retry' })).toHaveCount(1);
    });
  });

  test('HTML in a body is shown as text [SCN-followup-026]', async ({ page }) => {
    await seedFixture({
      id: 9963,
      body: '<script>window.__xss = true</script>',
      lang: 'en',
      hidden: false,
    });
    try {
      await gotoURL('/comments/9963');
      await expect(getLocatorByText('<script>window.__xss = true</script>')).toBeVisible();
      const executed = await page.evaluate(
        () => (window as unknown as { __xss?: boolean }).__xss === true,
      );
      expect(executed).toBe(false);
    } finally {
      await cleanupFixture();
    }
  });
});

test.describe('owner-admin follow-up', () => {
  // Admin scenarios mutate rows; reseed before each so they stay independent.
  // This repository does not ship the seed scripts; point this at your environment.
  test.beforeEach(() => {
    execSync(
      process.env.DB_RESET_COMMAND ??
        'npm --prefix ../../find-potential-stock/local-env run db:reset',
      { stdio: 'ignore' },
    );
  });

  test('an aged session expires [SCN-followup-027]', async () => {
    await signIn();
    await withDb((client) =>
      client.query(
        "UPDATE owner_session SET last_seen_at = now() - interval '31 minutes' WHERE token = (SELECT token FROM owner_session ORDER BY created_at DESC LIMIT 1)",
      ),
    );
    await gotoURL('/admin');
    await expectPageToHaveURL('/admin/login');
  });

  test('a wrong password shows the error copy [SCN-followup-028]', async () => {
    await gotoURL('/admin/login');
    await fill(getLocatorByRole('textbox', { name: 'Username' }), 'owner');
    await fill(getLocatorByRole('textbox', { name: 'Password' }), 'wrong');
    await click(getLocatorByRole('button', { name: 'Sign in' }));
    await expectElementToBeVisible(getLocatorByText('Invalid username or password.'));
  });

  test('an unknown username shows the same copy [SCN-followup-029]', async () => {
    await gotoURL('/admin/login');
    await fill(getLocatorByRole('textbox', { name: 'Username' }), 'nobody');
    await fill(getLocatorByRole('textbox', { name: 'Password' }), 'wrong');
    await click(getLocatorByRole('button', { name: 'Sign in' }));
    await expectElementToBeVisible(getLocatorByText('Invalid username or password.'));
  });

  test('admin search finds hidden comments [SCN-followup-030]', async () => {
    await signIn();
    await adminSearch('管理員隱藏');
    await expect(adminRow('呢個留言由管理員隱藏')).toHaveCount(1);
  });

  test('the author filter narrows the list [SCN-followup-031]', async () => {
    await signIn();
    await fill(getLocatorByRole('searchbox', { name: 'Author' }), '股壇新手');
    await expect(adminRow('股壇新手')).not.toHaveCount(0);
    await expect(adminRow('廣告王')).toHaveCount(0);
  });

  test('hidden comments carry a Hidden badge [SCN-followup-032]', async () => {
    await signIn();
    await expect(getLocatorByText('Hidden').first()).toBeVisible();
  });

  test('blocked comments carry a Blocked badge [SCN-followup-033]', async () => {
    await signIn();
    await expect(getLocatorByText('Blocked').first()).toBeVisible();
  });

  test('the owner hides a comment [SCN-followup-034]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Hide' }));
    await gotoURL('/comments/5001');
    await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
  });

  test('hiding keeps the row marked Hidden [SCN-followup-035]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Hide' }));
    await expect(adminRow('又破頂').getByText('Hidden')).toBeVisible();
  });

  test('the owner unhides a comment [SCN-followup-036]', async () => {
    await signIn();
    await adminSearch('管理員隱藏');
    await click(adminRow('呢個留言由管理員隱藏').getByRole('button', { name: 'Unhide' }));
    await gotoURL('/comments/5013');
    await expectElementToBeVisible(getLocatorByText('呢個留言由管理員隱藏。'));
  });

  test('the owner deletes a comment [SCN-followup-037]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Delete' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await gotoURL('/comments/5001');
    await expectElementToBeVisible(getLocatorByText('This comment is no longer available,'));
  });

  test('deleting writes an audit entry [SCN-followup-038]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Delete' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await expect(getLocatorByText('delete_comment').first()).toBeVisible();
  });

  test('cancelling delete changes nothing [SCN-followup-039]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Delete' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Cancel' }));
    await gotoURL('/comments/5001');
    await expect(getLocatorByText('This comment is no longer available,')).toHaveCount(0);
  });

  test('cancelling block changes nothing [SCN-followup-040]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Block' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Cancel' }));
    await expect(getLocatorByText('block_author')).toHaveCount(1);
  });

  test('blocking removes the author comments from the grid [SCN-followup-041]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Block' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await gotoURL('/search?q=%E7%A0%B4');
    await expect(getLocatorByText('又破頂')).toHaveCount(0);
  });

  test('unblocking restores an author [SCN-followup-042]', async () => {
    await signIn();
    await click(getLocatorByRole('button', { name: 'Unblock' }).first());
    await gotoURL('/search?q=%E4%BC%B0%E5%80%BC%E5%A4%AA%E9%AB%98');
    await expectElementToBeVisible(getLocatorByText('半導體股而家估值太高'));
  });

  test('blocking takes effect without re-collection [SCN-followup-043]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Block' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await gotoURL('/');
    await expect(getLocatorByText('{股壇新手(u2001)}')).toHaveCount(0);
  });

  test('the blocked author list is shown [SCN-followup-044]', async () => {
    await signIn();
    const row = getLocatorByRole('button', { name: 'Unblock' }).first().locator('xpath=ancestor::li[1]');
    await expect(row).toContainText('{廣告王(u2003)}');
  });

  test('the action log shows action, target and time [SCN-followup-045]', async () => {
    await signIn();
    const entry = getLocatorByRole('listitem').filter({ hasText: 'block_author' }).first();
    await expect(entry).toContainText('author');
    await expect(entry).toContainText('2026-10-01');
  });

  test('one hide adds one audit entry [SCN-followup-046]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Hide' }));
    await expect(getLocatorByText('hide_comment')).toHaveCount(1);
  });

  test('collection status lists the runs [SCN-followup-047]', async () => {
    await signIn();
    await expect(getLocatorByText('success')).toBeVisible();
    await expect(getLocatorByText('partial')).toBeVisible();
  });

  test('deleting a comment keeps its reply [SCN-followup-048]', async () => {
    await signIn();
    await adminSearch('Tesla 長線');
    await click(adminRow('Tesla 長線').getByRole('button', { name: 'Delete' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await gotoURL('/comments/5018');
    await expectElementToBeVisible(getLocatorByText('不過競爭對手都多咗。'));
  });

  test('a blocked author cannot be blocked twice [SCN-followup-049]', async () => {
    await signIn();
    await adminSearch('又破頂');
    await click(adminRow('又破頂').getByRole('button', { name: 'Block' }));
    await click(getLocatorByRole('dialog').getByRole('button', { name: 'Confirm' }));
    await expect(adminRow('又破頂').getByRole('button', { name: 'Block' })).toBeDisabled();
    await expect(getLocatorByText('block_author')).toHaveCount(2);
  });
});
