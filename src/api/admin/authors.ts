import type { BlockedAuthor } from '@/types';
import { apiGet, apiSend } from '@/api/client';

export async function listBlockedAuthors(request?: Request): Promise<BlockedAuthor[]> {
  const body = await apiGet<{ authors: BlockedAuthor[] }>(
    '/api/admin/authors?blocked=true',
    request,
  );
  return body.authors;
}

export function blockAuthor(id: number): Promise<{ id: number; isBlocked: boolean; changed: boolean }> {
  return apiSend('POST', `/api/admin/authors/${id}/block`);
}

export function unblockAuthor(
  id: number,
): Promise<{ id: number; isBlocked: boolean; changed: boolean }> {
  return apiSend('POST', `/api/admin/authors/${id}/unblock`);
}
