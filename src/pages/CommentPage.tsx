import { useParams } from 'react-router-dom';
import { ErrorState } from '@/components/comments/ErrorState';
import { LoadingState } from '@/components/comments/LoadingState';
import { PageShell } from '@/components/layout/PageShell';
import { ThreadComment } from '@/components/thread/ThreadComment';
import { ThreadHeader } from '@/components/thread/ThreadHeader';
import { Button } from '@/components/ui/button';
import { useThread } from '@/hooks/useThread';
import { en } from '@/locales/en';

export function CommentPage() {
  const { id } = useParams();
  const { comment, thread, missing, sourceUrl, error, loadingMore, loadMore, reload } =
    useThread(id);

  if (error) {
    return (
      <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
        <ErrorState onRetry={() => void reload()} />
      </PageShell>
    );
  }

  if (missing) {
    return (
      <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
        <div className="grid justify-items-start gap-2 rounded-xl border border-border bg-card p-8 shadow-sm">
          <p className="m-0 text-base font-bold text-foreground">
            {en.comments.missing}
          </p>
          {sourceUrl ? (
            <a className="text-accent-foreground underline-offset-4 hover:underline" href={sourceUrl}>
              {en.comments.viewOriginal}
            </a>
          ) : null}
        </div>
      </PageShell>
    );
  }

  if (!comment || !thread) {
    return (
      <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
        <LoadingState />
      </PageShell>
    );
  }

  return (
    <PageShell mainClassName="mx-auto w-full max-w-[920px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8 max-[767px]:pt-5">
      <ThreadHeader thread={thread.thread} />
      <div className="grid gap-3.5">
        {thread.comments.map((node) => (
          <ThreadComment key={node.id} node={node} highlighted={comment.id} />
        ))}
      </div>
      {thread.topLevel.page < thread.topLevel.totalPages ? (
        <Button
          type="button"
          className="mx-auto mt-5 block min-h-[2.7rem] px-6 border-primary bg-primary text-white hover:border-[#0a4656] hover:bg-[#0a4656] hover:text-white"
          onClick={() => void loadMore()}
          disabled={loadingMore}
        >
          {en.comments.loadMore}
        </Button>
      ) : null}
    </PageShell>
  );
}
