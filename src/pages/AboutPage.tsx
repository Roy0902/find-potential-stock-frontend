import { PageShell } from '@/components/layout/PageShell';
import { PROJECT_DISCLAIMER } from '@/lib/constants';

export function AboutPage() {
  return (
    <PageShell mainClassName="single">
      <h1>About</h1>
      <p>
        This archive collects public forum comments about stocks so they can be searched in one
        place.
      </p>
      <p>{PROJECT_DISCLAIMER}</p>
      <h2>Sources</h2>
      <ul>
        <li>
          <a href="https://lihkg.com">LIHKG</a>
        </li>
        <li>
          <a href="https://forum.hkgolden.com">HKGolden</a>
        </li>
      </ul>
      <h2>How mentions are detected</h2>
      <p>
        Comments are matched by cashtag ($AAPL), by bare uppercase tickers (AAPL), and by alias
        matching for company names and nicknames such as 蘋果 for AAPL.
      </p>
    </PageShell>
  );
}
