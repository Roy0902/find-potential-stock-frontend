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
import { Button } from '@/components/ui/button';
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
      <Button
        variant="outline"
        type="button"
        className="mx-4 mt-4 hidden w-[calc(100%-2rem)] border-input bg-card shadow-sm hover:border-primary max-[767px]:flex"
        aria-expanded={menuOpen}
        aria-controls="forum-sidebar"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Forums
      </Button>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[250px_minmax(0,1fr)] items-start gap-8 px-[clamp(1rem,3vw,2rem)] pb-14 pt-8 max-[1100px]:grid-cols-[220px_minmax(0,1fr)] max-[1100px]:gap-6 max-[767px]:grid-cols-1 max-[767px]:gap-5 max-[767px]:pt-5">
        <ForumSidebar
          forums={forums}
          activeForum={forum || undefined}
          query={q}
          open={menuOpen}
          onNavigate={() => setMenuOpen(false)}
        />
        <main id="main-content" className="min-w-0">
          <header className="mb-6">
            <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
              Public archive
            </p>
            <h1 className="m-0 text-[clamp(1.75rem,2.7vw,2.45rem)] font-bold tracking-[-0.035em] leading-tight max-[900px]:text-3xl">
              {q ? 'Search results' : 'Comment archive'}
            </h1>
            <p className="mt-2 max-w-[62ch] text-[0.94rem] text-muted-foreground">
              {q
                ? `Public forum comments matching \u201c${q}\u201d.`
                : 'Search conversations about stocks from public forums, archived in one place.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                {total === undefined
                  ? 'Loading comments'
                  : `${total.toLocaleString('en-US')} comment${total === 1 ? '' : 's'}`}
              </span>
              {q ? (
                <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  Search: {q}
                </span>
              ) : null}
              {activeForumName ? (
                <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  Forum: {activeForumName}
                </span>
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
