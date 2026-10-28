import { ApiError, getComment, getThread } from '../../src/api';
import type { Route } from './+types/comment';
import { CommentPage } from '../../src/pages/CommentPage';

export async function loader({ params, request }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) throw new Response('Not Found', { status: 404 });

  try {
    const comment = await getComment(id, request);
    const thread = await getThread(
      comment.threadId,
      { commentId: id, page: 1 },
      request,
    );
    return { id, comment, thread, missing: false, sourceUrl: null, error: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        id,
        comment: null,
        thread: null,
        missing: true,
        sourceUrl: error.sourceUrl,
        error: false,
      };
    }
    return { id, comment: null, thread: null, missing: false, sourceUrl: null, error: true };
  }
}

export default function CommentRoute({ loaderData }: Route.ComponentProps) {
  return <CommentPage key={loaderData.id} loaderData={loaderData} />;
}
