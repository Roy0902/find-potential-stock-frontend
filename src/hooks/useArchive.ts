import { useCallback, useEffect, useState } from 'react';
import { listComments, listForums } from '@/api';
import type { CommentSummary, Forum, Paged } from '@/types';

export function useArchive({
  page,
  q,
  forum,
  onClamp,
}: {
  page: number;
  q: string;
  forum: string;
  onClamp: (totalPages: number) => void;
}) {
  const [data, setData] = useState<Paged<CommentSummary> | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [comments, forumList] = await Promise.all([
        listComments({ page, search: q || undefined, forumId: forum || undefined }),
        listForums(),
      ]);
      setData(comments);
      setForums(forumList);
      const totalPages = comments.pagination.totalPages;
      if (totalPages > 0 && page > totalPages) onClamp(totalPages);
    } catch {
      setError(true);
    }
  }, [page, q, forum, onClamp]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, forums, error, reload: load };
}
