import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

export function NotFoundPage() {
  return (
    <PageShell mainClassName="single single--narrow">
      <div className="not-found">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or has moved.</p>
        <Link to="/">Go to home</Link>
      </div>
    </PageShell>
  );
}
