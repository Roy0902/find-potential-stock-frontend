import type { ThreadPageData } from '@/types';
import { THREAD_PAGE_SIZE } from '@/lib/constants';
import { apiGet } from './client';

export function getThread(
  threadId: number | string,
  options: { commentId?: number | string; page?: number; pageSize?: number } = {},
): Promise<ThreadPageData> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? THREAD_PAGE_SIZE),
  });
  if (options.commentId !== undefined) query.set('commentId', String(options.commentId));
  return apiGet<ThreadPageData>(`/api/threads/${threadId}?${query.toString()}`);
}
