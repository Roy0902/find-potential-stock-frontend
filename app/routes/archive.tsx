import { redirect } from 'react-router';
import type { Route } from './+types/archive';
import { listComments, listForums } from '../../src/api';
import { ArchivePage } from '../../src/pages/ArchivePage';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get('page') ?? '1') || 1, 1);
  const q = url.searchParams.get('q') ?? '';
  const forum = url.searchParams.get('forum') ?? '';

  try {
    const [data, forums] = await Promise.all([
      listComments(
        { page, search: q || undefined, forumId: forum || undefined },
        request,
      ),
      listForums(request),
    ]);

    if (data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      url.searchParams.set('page', String(data.pagination.totalPages));
      return redirect(`${url.pathname}${url.search}`);
    }

    return { data, forums, error: false };
  } catch {
    return { data: null, forums: [], error: true };
  }
}

export default function ArchiveRoute({ loaderData }: Route.ComponentProps) {
  return <ArchivePage loaderData={loaderData} />;
}
