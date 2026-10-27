import { Link } from 'react-router-dom';
import { Bar } from './Bar';
import { SiteName } from './SiteName';
import { SearchBar } from '@/components/search/SearchBar';

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
      <nav className="site-nav" aria-label="Site">
        <Link to="/about">About</Link>
      </nav>
    </Bar>
  );
}
