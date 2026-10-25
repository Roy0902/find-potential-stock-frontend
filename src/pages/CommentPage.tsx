import { useParams } from 'react-router-dom';
import { ErrorState } from '@/components/comments/ErrorState';
import { LoadingState } from '@/components/comments/LoadingState';
import { PageShell } from '@/components/layout/PageShell';
import { ThreadComment } from '@/components/thread/ThreadComment';
import { ThreadHeader } from '@/components/thread/ThreadHeader';
import { useThread } from '@/hooks/useThread';

export function CommentPage() {
  const { id } = useParams();
  const { comment, thread, missing, sourceUrl, error, loadingMore, loadMore, reload } =
    useThread(id);

  if (error) {
    return (
      <main id="main-content" className="single">
        <ErrorState onRetry={() => void reload()} />
      </main>
    );
  }

  if (missing) {
    return (
      <main id="main-content" className="single">
        <p>This comment is no longer available,</p>
        {sourceUrl ? <a href={sourceUrl}>View original post</a> : null}
      </main>
    );
  }

  if (!comment || !thread) {
    return (
      <main id="main-content" className="single">
        <LoadingState />
      </main>
    );
  }

  return (
    <PageShell mainClassName="single">
      <ThreadHeader thread={thread.thread} />
      <div className="thread">
        {thread.comments.map((node) => (
          <ThreadComment key={node.id} node={node} highlighted={comment.id} />
        ))}
      </div>
      {thread.topLevel.page < thread.topLevel.totalPages ? (
        <button type="button" onClick={() => void loadMore()} disabled={loadingMore}>
          Load more
        </button>
      ) : null}
    </PageShell>
  );
}
