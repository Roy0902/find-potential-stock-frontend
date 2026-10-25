import { apiSend } from '@/api/client';

export function login(username: string, password: string): Promise<{ ok: boolean }> {
  return apiSend<{ ok: boolean }>('POST', '/api/admin/login', { username, password });
}

export function logout(): Promise<void> {
  return apiSend<void>('POST', '/api/admin/logout');
}
