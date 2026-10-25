import type { Forum } from '@/types';
import { apiGet } from './client';

export async function listForums(): Promise<Forum[]> {
  const body = await apiGet<{ forums: Forum[] }>('/api/forums');
  return body.forums;
}
