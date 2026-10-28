import { Link } from 'react-router';
import { Bar } from './Bar';
import { SiteName } from './SiteName';
import { SearchBar } from '@/components/search/SearchBar';
import { en } from '@/locales/en';

export function Header({
  initialQuery,
  activeForum,
}: {
  initialQuery?: string;
  activeForum?: string;
}) {
  return (
    <Bar>
      <SiteName />
      <SearchBar initial={initialQuery} activeForum={activeForum} />
      <nav
        className="flex items-center justify-self-end gap-1 max-[767px]:col-start-2 max-[767px]:row-start-1"
        aria-label={en.accessibility.siteNavigation}
      >
        <Link
          to="/about"
          className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {en.navigation.about}
        </Link>
      </nav>
    </Bar>
  );
}
