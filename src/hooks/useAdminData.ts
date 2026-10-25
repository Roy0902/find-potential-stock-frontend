import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  listActions,
  listAdminComments,
  listBlockedAuthors,
  listScrapeRuns,
} from '@/api';
import type { AdminAction, AdminComment, BlockedAuthor, ScrapeRun } from '@/types';

export function useAdminData({
  page,
  q,
  author,
  source,
  onClamp,
  onUnauthorized,
}: {
  page: number;
  q: string;
  author: string;
  source: string;
  onClamp: (page: number) => void;
  onUnauthorized: () => void;
}) {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [blocked, setBlocked] = useState<BlockedAuthor[]>([]);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const sequence = useRef(0);

  const load = useCallback(async () => {
    const current = ++sequence.current;
    try {
      const [commentPage, blockedAuthors, actionList, runList] = await Promise.all([
        listAdminComments({
          page,
          q: q || undefined,
          author: author || undefined,
          source: source || undefined,
        }),
        listBlockedAuthors(),
        listActions(),
        listScrapeRuns(),
      ]);
      if (current !== sequence.current) return;

      setBlocked(blockedAuthors);
      setActions(actionList);
      setRuns(runList);
      setTotalPages(commentPage.pagination.totalPages);

      const maxPage = Math.max(1, commentPage.pagination.totalPages);
      if (page > maxPage) {
        onClamp(maxPage);
        return;
      }
      setComments(commentPage.comments);
    } catch (caught) {
      if (current !== sequence.current) return;
      if (caught instanceof ApiError && caught.status === 401) onUnauthorized();
    }
  }, [author, onClamp, onUnauthorized, page, q, source]);

  useEffect(() => {
    void load();
  }, [load]);

  return { comments, blocked, actions, runs, totalPages, reload: load };
}
