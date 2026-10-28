import type { AdminComment, Paged } from '@/types';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';
import { apiGet, apiSend } from '@/api/client';

export type AdminCommentQuery = {
  page: number;
  pageSize?: number;
  q?: string;
  author?: string;
  source?: string;
};

export function listAdminComments({
  page,
  pageSize = ADMIN_PAGE_SIZE,
  q,
  author,
  source,
}: AdminCommentQuery, request?: Request): Promise<Paged<AdminComment>> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) query.set('q', q);
  if (author) query.set('author', author);
  if (source) query.set('source', source);
  return apiGet<Paged<AdminComment>>(`/api/admin/comments?${query.toString()}`, request);
}

export function setCommentHidden(
  id: number,
  hidden: boolean,
): Promise<{ id: number; isHidden: boolean; hiddenReason: string | null }> {
  return apiSend('PATCH', `/api/admin/comments/${id}/hidden`, { hidden });
}

export function deleteComment(id: number): Promise<void> {
  return apiSend<void>('DELETE', `/api/admin/comments/${id}`);
}
