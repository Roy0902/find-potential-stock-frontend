import { Link } from 'react-router';
import type { Forum } from '@/types';
import { searchPath } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { en } from '@/locales/en';

export function ForumSidebar({
  forums,
  activeForum,
  query,
  open,
  onNavigate,
}: {
  forums: Forum[];
  activeForum?: string;
  query?: string;
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      id="forum-sidebar"
      aria-label={en.accessibility.forumsNavigation}
      className={cn(
        'sticky top-[5.6rem] rounded-xl border border-border bg-card p-4 shadow-sm max-[767px]:static',
        open ? 'max-[767px]:block' : 'max-[767px]:hidden',
      )}
    >
      <p className="mb-3 px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">
        {en.forums.title}
      </p>
      <div className="grid gap-1">
        <Link
          to={searchPath(query)}
          aria-current={activeForum ? undefined : 'page'}
          onClick={onNavigate}
          className="group flex min-h-10 items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground aria-[current=page]:shadow-[inset_3px_0_0_var(--primary)]"
        >
          <span>{en.forums.all}</span>
        </Link>
        {forums.map((forum) => (
          <Link
            key={forum.id}
            to={searchPath(query, String(forum.id))}
            aria-current={activeForum === String(forum.id) ? 'page' : undefined}
            onClick={onNavigate}
            className="flex min-h-10 items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground aria-[current=page]:shadow-[inset_3px_0_0_var(--primary)]"
          >
            <span className="flex w-full items-center justify-between gap-3">
              {forum.name}{' '}
              <span className="flex-none rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground group-aria-[current=page]:bg-card group-aria-[current=page]:text-accent-foreground">
                {forum.commentCount}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
