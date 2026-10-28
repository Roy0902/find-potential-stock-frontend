import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

export function NotFoundPage() {
  return (
    <PageShell mainClassName="mx-auto w-full max-w-[760px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          404
        </p>
        <h1 className="mb-2 mt-0">Page not found</h1>
        <p className="mb-4 mt-0 text-muted-foreground">
          The page you requested does not exist or has moved.
        </p>
        <Link
          className="inline-flex min-h-10 items-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#0a4656]"
          to="/"
        >
          Go to home
        </Link>
      </div>
    </PageShell>
  );
}
