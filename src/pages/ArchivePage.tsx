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

  const activeForumName = forums.find((entry) => String(entry.id) === forum)?.name;
  const total = data?.pagination.total;

  return (
    <>
      <Header initialQuery={q} activeForum={forum || undefined} />
      <button
        type="button"
        className="menu-button"
        aria-expanded={menuOpen}
        aria-controls="forum-sidebar"
        onClick={() => setMenuOpen((open) => !open)}
      >
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
          <header className="archive-intro">
            <p className="eyebrow">Public archive</p>
            <h1>{q ? 'Search results' : 'Comment archive'}</h1>
            <p className="archive-subtitle">
              {q
                ? `Public forum comments matching \u201c${q}\u201d.`
                : 'Search conversations about stocks from public forums, archived in one place.'}
            </p>
            <div className="archive-meta">
              <span className="archive-count">
                {total === undefined
                  ? 'Loading comments'
                  : `${total.toLocaleString('en-US')} comment${total === 1 ? '' : 's'}`}
              </span>
              {q ? <span className="filter-chip">Search: {q}</span> : null}
              {activeForumName ? (
                <span className="filter-chip">Forum: {activeForumName}</span>
              ) : null}
            </div>
          </header>
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
