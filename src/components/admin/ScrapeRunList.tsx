import type { ScrapeRun } from '@/types';

export function ScrapeRunList({ runs }: { runs: ScrapeRun[] }) {
  return (
    <ul>
      {runs.map((run) => (
        <li key={run.id}>
          <span>{run.status}</span> <span>{run.mode}</span>{' '}
          <span>
            added {run.commentsAdded}, updated {run.commentsUpdated}, skipped{' '}
            {run.commentsSkippedRestricted}
          </span>
        </li>
      ))}
    </ul>
  );
}
