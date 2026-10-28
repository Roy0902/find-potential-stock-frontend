import type { ScrapeRun } from '@/types';
import { cn } from '@/lib/utils';

export function ScrapeRunList({ runs }: { runs: ScrapeRun[] }) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0 [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-2 [&>li]:rounded-sm [&>li]:border [&>li]:border-border [&>li]:bg-white [&>li]:px-3 [&>li]:py-2.5 [&>li]:text-sm">
      {runs.map((run) => (
        <li key={run.id}>
          <span
            className={cn(
              'inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-secondary-foreground',
              (run.status === 'failed' || run.status === 'blocked') &&
                'bg-[#fef3f2] text-[#b42318]',
              run.status === 'success' && 'bg-[#ecfdf3] text-[#087443]',
              run.status === 'partial' && 'bg-[#fffaeb] text-[#b54708]',
            )}
          >
            {run.status}
          </span>
          <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{run.mode}</span>
            <span>
              added {run.commentsAdded}, updated {run.commentsUpdated}, skipped{' '}
              {run.commentsSkippedRestricted}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
