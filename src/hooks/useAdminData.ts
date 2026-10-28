import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  listActions,
  listAdminComments,
  listBlockedAuthors,
  listScrapeRuns,
} from '@/api';
import type { AdminAction, AdminComment, BlockedAuthor, ScrapeRun } from '@/types';

export type AdminData = {
  comments: AdminComment[];
  blocked: BlockedAuthor[];
  actions: AdminAction[];
  runs: ScrapeRun[];
  totalPages: number;
};

export function useAdminData({
  initialData,
  page,
  q,
  author,
  source,
  onClamp,
  onUnauthorized,
}: {
  initialData: AdminData;
  page: number;
  q: string;
  author: string;
  source: string;
  onClamp: (page: number) => void;
  onUnauthorized: () => void;
}) {
  const [comments, setComments] = useState(initialData.comments);
  const [blocked, setBlocked] = useState(initialData.blocked);
  const [actions, setActions] = useState(initialData.actions);
  const [runs, setRuns] = useState(initialData.runs);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const sequence = useRef(0);
  const isInitialMount = useRef(true);

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
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    void load();
  }, [load]);

  return { comments, blocked, actions, runs, totalPages, reload: load };
}
