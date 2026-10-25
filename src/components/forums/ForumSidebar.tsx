import { Link } from 'react-router-dom';
import type { Forum } from '@/types';
import { searchPath } from '@/lib/urls';

export function ForumSidebar({
  forums,
  activeForum,
  query,
  open,
  onNavigate,
}: {
  forums: Forum[];
  activeForum?: string;
  query?: string;
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Forums" className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-links">
        <Link
          to={searchPath(query)}
          aria-current={activeForum ? undefined : 'page'}
          onClick={onNavigate}
        >
          All forums
        </Link>
        {forums.map((forum) => (
          <Link
            key={forum.id}
            to={searchPath(query, String(forum.id))}
            aria-current={activeForum === String(forum.id) ? 'page' : undefined}
            onClick={onNavigate}
          >
            {forum.name} {forum.commentCount}
          </Link>
        ))}
      </div>
    </nav>
  );
}
