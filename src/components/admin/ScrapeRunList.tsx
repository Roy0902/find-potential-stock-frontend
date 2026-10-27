import type { ScrapeRun } from '@/types';

export function ScrapeRunList({ runs }: { runs: ScrapeRun[] }) {
  return (
    <ul>
      {runs.map((run) => (
        <li key={run.id}>
          <span className={`badge badge--${run.status}`}>{run.status}</span>
          <span className="scrape-meta">
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
