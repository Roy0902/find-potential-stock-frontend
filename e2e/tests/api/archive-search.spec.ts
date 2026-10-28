import { test, expect } from '@fixturesetup';
import { getRequest } from 'vasu-playwright-utils';
import { withDb } from '../utils/db.js';

/**
 * API contract tests for the frozen archive-search plan (local-env/specs/archive-search.md).
 * Runs against the real local API, never a route mock.
 */
test.use({ baseURL: process.env.API_URL ?? 'http://localhost:3000' });

type Row = { id: number; body: string; postedAt: string };

async function seedForum(sourceId: number, rows: Row[]) {
  await withDb(async (client) => {
    await client.query('DELETE FROM source WHERE id = $1', [sourceId]);
    await client.query(
      "INSERT INTO source (id, name, base_url, enabled) VALUES ($1, $2, 'https://fixture.test', false)",
      [sourceId, `Fixture ${sourceId}`],
    );
    await client.query(
      "INSERT INTO thread (id, source_id, external_id, title, url, first_seen_at) VALUES ($1, $1, 'fixture-thread', 'Fixture thread', 'https://fixture.test/t/1', now())",
      [sourceId],
    );
    await client.query(
      "INSERT INTO author (id, source_id, external_id, display_name) VALUES ($1, $1, 'fixture-author', 'Fixture Author')",
      [sourceId],
    );
    for (const row of rows) {
      await client.query(
        `INSERT INTO comment (id, source_id, thread_id, author_id, external_id, body, posted_at, url, first_seen_at, last_seen_at)
         VALUES ($1, $2, $2, $2, $3, $4, $5, $6, now(), now())`,
        [row.id, sourceId, `fixture-c-${row.id}`, row.body, row.postedAt, `https://fixture.test/c/${row.id}`],
      );
    }
  });
}

async function dropForum(sourceId: number) {
  await withDb((client) => client.query('DELETE FROM source WHERE id = $1', [sourceId]));
}

async function getJson(url: string) {
  const response = await getRequest(url);
  expect(response.status()).toBe(200);
  return response.json();
}

const NVDA_ROWS: Row[] = Array.from({ length: 56 }, (_, index) => ({
  id: 9200 + index,
  body: `NVDA fixture comment ${index + 1}`,
  postedAt: new Date(Date.UTC(2026, 9, 2, 0, index)).toISOString(),
}));

test.beforeEach(async ({ page }) => {
  // vasu helpers need the page fixture, and getRequest uses page.request.
  void page;
});

test.describe('pagination and search', () => {
  test('search results hold 20 per page [REQ-archive-search-004][SCN-archive-search-005]', async () => {
    await seedForum(9200, NVDA_ROWS);
    try {
      const body = await getJson('/api/comments?search=NVDA&forumId=9200&pageSize=20&page=1');
      expect(body.comments).toHaveLength(20);
      expect(body.pagination).toMatchObject({ page: 1, pageSize: 20, total: 56, totalPages: 3 });
    } finally {
      await dropForum(9200);
    }
  });

  test('the last results page holds the remainder [REQ-archive-search-004][SCN-archive-search-006]', async () => {
    await seedForum(9201, NVDA_ROWS.map((row) => ({ ...row, id: row.id + 100 })));
    try {
      const body = await getJson('/api/comments?search=NVDA&forumId=9201&pageSize=20&page=3');
      expect(body.comments).toHaveLength(16);
      expect(body.pagination.total).toBe(56);
    } finally {
      await dropForum(9201);
    }
  });

  test('search and forum parameters work together [REQ-archive-search-006][SCN-archive-search-008]', async () => {
    const body = await getJson('/api/comments?search=%E9%95%B7%E7%B7%9A%E7%9D%87%E5%A5%BD&forumId=1');
    expect(body.pagination.total).toBe(1);
    expect(body.comments[0].id).toBe(5017);
    expect(body.comments.every((comment: { sourceName: string }) => comment.sourceName === 'LIHKG')).toBe(true);
  });

  test('an unknown forum is treated as no filter [REQ-archive-search-006][SCN-archive-search-009]', async () => {
    const body = await getJson('/api/comments?forumId=999');
    expect(body.pagination.total).toBe(71);
    expect(body.pagination.pageSize).toBe(20);
  });

  test('a one-character query is a real search [REQ-archive-search-007][SCN-archive-search-011]', async () => {
    const body = await getJson('/api/comments?search=%E7%A0%B4');
    expect(body.pagination.total).toBe(1);
    expect(body.comments[0].id).toBe(5001);
  });

  test('the home grid shows 20 cards [REQ-archive-search-010][SCN-archive-search-015]', async () => {
    const body = await getJson('/api/comments');
    expect(body.comments).toHaveLength(20);
    expect(body.pagination.pageSize).toBe(20);
  });

  test('the excerpt is the first 200 characters [REQ-archive-search-013][SCN-archive-search-019]', async () => {
    const body260 = `${'x'.repeat(200)}MARKER${'y'.repeat(54)}`;
    await seedForum(9202, [{ id: 9300, body: body260, postedAt: '2026-10-02T00:00:00.000Z' }]);
    try {
      const body = await getJson('/api/comments?forumId=9202');
      const [comment] = body.comments;
      expect([...comment.excerpt]).toHaveLength(200);
      expect(comment.excerpt).not.toContain('MARKER');
      expect(comment.body).toBe(body260);
    } finally {
      await dropForum(9202);
    }
  });

  test('a body of exactly 200 characters is shown whole [REQ-archive-search-013][SCN-archive-search-020]', async () => {
    const exact = 'z'.repeat(200);
    await seedForum(9203, [{ id: 9301, body: exact, postedAt: '2026-10-02T00:00:00.000Z' }]);
    try {
      const body = await getJson('/api/comments?forumId=9203');
      expect(body.comments[0].excerpt).toBe(exact);
    } finally {
      await dropForum(9203);
    }
  });
});

test.describe('sidebar data', () => {
  test('forum counts exclude hidden and blocked content [REQ-archive-search-019][SCN-archive-search-028]', async () => {
    const body = await getJson('/api/forums');
    const byName = Object.fromEntries(
      body.forums.map((forum: { name: string; commentCount: number }) => [forum.name, forum.commentCount]),
    );
    expect(byName.LIHKG).toBe(71);
    expect(byName.HKGolden).toBeUndefined();
  });

  test('forums are alphabetical and omit empty ones [REQ-archive-search-021][SCN-archive-search-031]', async () => {
    const body = await getJson('/api/forums');
    const names = body.forums.map((forum: { name: string }) => forum.name);
    expect(names).toEqual(['LIHKG']);
  });

  test('a selected forum is newest first [REQ-archive-search-023][SCN-archive-search-034]', async () => {
    const body = await getJson('/api/comments?forumId=1');
    expect(body.comments).toHaveLength(20);
    const postedAt = body.comments.map((comment: { postedAt: string }) => comment.postedAt);
    expect([...postedAt].sort().reverse()).toEqual(postedAt);
  });

  test('a forum-filtered grid keeps 20 per page [REQ-archive-search-024][SCN-archive-search-035]', async () => {
    const body = await getJson('/api/comments?forumId=1');
    expect(body.comments).toHaveLength(20);
    expect(body.pagination.total).toBe(71);
  });

  test('a forum-filtered grid ends with the remainder [REQ-archive-search-024][SCN-archive-search-036]', async () => {
    const body = await getJson('/api/comments?forumId=1&page=4');
    expect(body.comments).toHaveLength(11);
  });
});

test.describe('search inside a forum', () => {
  test('a keyword search stays inside the selected forum [REQ-archive-search-027][SCN-archive-search-041]', async () => {
    const body = await getJson('/api/comments?search=%E9%95%B7%E7%B7%9A%E7%9D%87%E5%A5%BD&forumId=1');
    expect(body.pagination.total).toBe(1);
    expect(body.comments[0].id).toBe(5017);
  });

  test('a keyword found only outside the forum yields nothing [REQ-archive-search-027][SCN-archive-search-042]', async () => {
    // "Tesla" is visible in LIHKG, but the selected EmptyForum fixture has no visible comment.
    const body = await getJson('/api/comments?search=Tesla&forumId=3');
    expect(body.pagination.total).toBe(0);
    expect(body.comments).toEqual([]);
  });
});
