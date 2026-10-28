import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { getThread } from '@/api';
import { ErrorState } from '@/components/comments/ErrorState';
import { LoadingState } from '@/components/comments/LoadingState';
import { PageShell } from '@/components/layout/PageShell';
import { ThreadComment } from '@/components/thread/ThreadComment';
import { ThreadHeader } from '@/components/thread/ThreadHeader';
import { Button } from '@/components/ui/button';
import { en } from '@/locales/en';
import type { CommentSummary, ThreadPageData } from '@/types';

type CommentLoaderData = {
  id: string;
  comment: CommentSummary | null;
  thread: ThreadPageData | null;
  missing: boolean;
  sourceUrl: string | null;
  error: boolean;
};

export function CommentPage({ loaderData }: { loaderData: CommentLoaderData }) {
  const { id, comment, missing, sourceUrl, error } = loaderData;
  const revalidator = useRevalidator();
  const [thread, setThread] = useState(loaderData.thread);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!thread || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const pageData = await getThread(thread.thread.id, { commentId: id, page: next });
      setThread({ ...pageData, comments: [...thread.comments, ...pageData.comments] });
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  };

  if (error) {
    return (
      <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
        <ErrorState onRetry={() => void revalidator.revalidate()} />
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
