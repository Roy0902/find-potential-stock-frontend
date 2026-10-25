import { useCallback, useEffect, useState } from 'react';
import { ApiError, getComment, getThread } from '@/api';
import type { CommentSummary, ThreadPageData } from '@/types';

export function useThread(id: string | undefined) {
  const [comment, setComment] = useState<CommentSummary | null>(null);
  const [thread, setThread] = useState<ThreadPageData | null>(null);
  const [missing, setMissing] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(false);
    setMissing(false);
    setSourceUrl(null);
    try {
      const summary = await getComment(id);
      setComment(summary);
      const pageData = await getThread(summary.threadId, { commentId: id, page: 1 });
      setThread(pageData);
      setPage(1);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 404) {
        setMissing(true);
        setSourceUrl(caught.sourceUrl);
        setComment(null);
        setThread(null);
      } else {
        setError(true);
      }
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

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

  return { comment, thread, missing, sourceUrl, error, loadingMore, loadMore, reload: load };
}
