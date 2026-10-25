import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';

export function NotFoundPage() {
  return (
    <PageShell mainClassName="single">
      <h1>Page not found</h1>
      <Link to="/">Go to home</Link>
    </PageShell>
  );
}
