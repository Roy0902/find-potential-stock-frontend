import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { PROJECT_DISCLAIMER } from '@/lib/constants';

export function AboutPage() {
  return (
    <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
      <article>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground no-underline hover:text-accent-foreground"
        >
          Back to archive
        </Link>
        <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          About this project
        </p>
        <h1 className="mb-4 mt-0 text-[clamp(1.8rem,2.8vw,2.4rem)] font-bold tracking-[-0.035em]">
          About
        </h1>
        <p className="my-3 text-secondary-foreground leading-relaxed">
          This archive collects public forum comments about stocks so they can be searched in one
          place.
        </p>
        <p className="my-3 text-secondary-foreground leading-relaxed">{PROJECT_DISCLAIMER}</p>
        <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">Sources</h2>
        <ul className="my-3 list-disc space-y-2 pl-5 text-secondary-foreground leading-relaxed">
          <li>
            <a href="https://lihkg.com">LIHKG</a>
          </li>
          <li>
            <a href="https://forum.hkgolden.com">HKGolden</a>
          </li>
        </ul>
        <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">How mentions are detected</h2>
        <p className="my-3 text-secondary-foreground leading-relaxed">
          Comments are matched by cashtag ($AAPL), by bare uppercase tickers (AAPL), and by alias
          matching for company names and nicknames such as 蘋果 for AAPL.
        </p>
      </article>
    </PageShell>
  );
}
