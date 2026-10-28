import { Link } from 'react-router-dom';
import type { ThreadMeta } from '@/types';
import { en } from '@/locales/en';

export function ThreadHeader({ thread }: { thread: ThreadMeta }) {
  return (
    <>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground no-underline hover:text-accent-foreground"
      >
        {en.navigation.backToArchive}
      </Link>
      <header className="mb-5 rounded-xl border border-border bg-card p-6 shadow-sm max-[480px]:p-4">
        <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          {en.thread.eyebrow}
        </p>
        <h1 className="my-2 text-2xl font-bold tracking-tight">{thread.title}</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-accent-foreground">
            {thread.sourceName}
          </span>
          <a
            className="inline-flex min-h-9 items-center rounded-sm border border-input px-3 text-xs font-semibold text-secondary-foreground no-underline hover:border-primary hover:bg-accent hover:text-accent-foreground"
            href={thread.sourceUrl}
          >
            {en.thread.viewSource}
          </a>
        </div>
      </header>
    </>
  );
}
