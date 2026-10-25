import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/comments/EmptyState';
import { ErrorState } from '@/components/comments/ErrorState';
import { LoadingState } from '@/components/comments/LoadingState';
import { CommentGrid } from '@/components/comments/CommentGrid';
import { Pagination } from '@/components/comments/Pagination';
import { ForumSidebar } from '@/components/forums/ForumSidebar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useArchive } from '@/hooks/useArchive';

export function ArchivePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const forum = params.get('forum') ?? '';
  const page = Math.max(Number(params.get('page') ?? '1') || 1, 1);
  const [menuOpen, setMenuOpen] = useState(false);

  const clamp = useCallback(
    (totalPages: number) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set('page', String(totalPages));
        return next;
      });
    },
    [setParams],
  );

  const { data, forums, error, reload } = useArchive({ page, q, forum, onClamp: clamp });

  const setPage = (next: number) => {
    const nextParams = new URLSearchParams(params);
    if (next <= 1) nextParams.delete('page');
    else nextParams.set('page', String(next));
    setParams(nextParams);
  };

  return (
    <>
      <Header initialQuery={q} activeForum={forum || undefined} />
      <button type="button" className="menu-button" onClick={() => setMenuOpen((open) => !open)}>
        Forums
      </button>
      <div className="layout">
        <ForumSidebar
          forums={forums}
          activeForum={forum || undefined}
          query={q}
          open={menuOpen}
          onNavigate={() => setMenuOpen(false)}
        />
        <main id="main-content">
          {error ? (
            <ErrorState onRetry={() => void reload()} />
          ) : !data ? (
            <LoadingState />
          ) : data.pagination.total === 0 ? (
            <EmptyState />
          ) : (
            <>
              <CommentGrid comments={data.comments} />
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onChange={setPage}
              />
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
