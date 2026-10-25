import type { AdminAction, ScrapeRun } from '@/types';
import { apiGet } from '@/api/client';

/** Collection operations: the audit log and scheduled scrape runs. */
export async function listActions(limit = 50): Promise<AdminAction[]> {
  const body = await apiGet<{ actions: AdminAction[] }>(`/api/admin/actions?limit=${limit}`);
  return body.actions;
}

export async function listScrapeRuns(limit = 20): Promise<ScrapeRun[]> {
  const body = await apiGet<{ runs: ScrapeRun[] }>(`/api/admin/scrape-runs?limit=${limit}`);
  return body.runs;
}
