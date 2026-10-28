import { Link } from 'react-router-dom';
import { Bar } from './Bar';
import { SiteName } from './SiteName';

export function AdminBar() {
  return (
    <Bar>
      <SiteName />
      <nav
        className="flex items-center justify-self-end gap-1 max-[767px]:col-start-2 max-[767px]:row-start-1"
        aria-label="Site"
      >
        <Link
          to="/"
          className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View site
        </Link>
      </nav>
    </Bar>
  );
}
