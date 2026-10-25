import type { CommentSummary, Paged } from '@/types';
import { COMMENTS_PAGE_SIZE } from '@/lib/constants';
import { apiGet } from './client';

export type CommentQuery = {
  page: number;
  pageSize?: number;
  search?: string;
  forumId?: string;
};

export function listComments({
  page,
  pageSize = COMMENTS_PAGE_SIZE,
  search,
  forumId,
}: CommentQuery): Promise<Paged<CommentSummary>> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) query.set('search', search);
  if (forumId) query.set('forumId', forumId);
  return apiGet<Paged<CommentSummary>>(`/api/comments?${query.toString()}`);
}

export function getComment(id: number | string): Promise<CommentSummary> {
  return apiGet<CommentSummary>(`/api/comments/${id}`);
}
