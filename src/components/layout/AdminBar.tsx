import { Link } from 'react-router-dom';
import { Bar } from './Bar';
import { SiteName } from './SiteName';

export function AdminBar() {
  return (
    <Bar>
      <SiteName />
      <nav className="site-nav" aria-label="Site">
        <Link to="/">View site</Link>
      </nav>
    </Bar>
  );
}
