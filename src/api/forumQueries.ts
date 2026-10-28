import type { Forum } from '@/types';
import { apiGet } from './client';

export async function listForums(request?: Request): Promise<Forum[]> {
  const body = await apiGet<{ forums: Forum[] }>('/api/forums', request);
  return body.forums;
}
