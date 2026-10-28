import { redirect } from 'react-router';
import type { Route } from './+types/admin';
import {
  ApiError,
  listActions,
  listAdminComments,
  listBlockedAuthors,
  listScrapeRuns,
} from '../../src/api';
import { AdminPage } from '../../src/pages/admin/AdminPage';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const [commentPage, blocked, actions, runs] = await Promise.all([
      listAdminComments({ page: 1 }, request),
      listBlockedAuthors(request),
      listActions(50, request),
      listScrapeRuns(20, request),
    ]);

    return {
      comments: commentPage.comments,
      blocked,
      actions,
      runs,
      totalPages: commentPage.pagination.totalPages,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect('/admin/login');
    }
    throw error;
  }
}

export default function AdminRoute({ loaderData }: Route.ComponentProps) {
  return <AdminPage loaderData={loaderData} />;
}
