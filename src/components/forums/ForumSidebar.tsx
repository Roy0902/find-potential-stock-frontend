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
    <nav
      id="forum-sidebar"
      aria-label="Forums"
      className={`sidebar${open ? ' open' : ''}`}
    >
      <p className="sidebar-title">Forums</p>
      <div className="sidebar-links">
        <Link
          to={searchPath(query)}
          aria-current={activeForum ? undefined : 'page'}
          onClick={onNavigate}
        >
          <span>All forums</span>
        </Link>
        {forums.map((forum) => (
          <Link
            key={forum.id}
            to={searchPath(query, String(forum.id))}
            aria-current={activeForum === String(forum.id) ? 'page' : undefined}
            onClick={onNavigate}
          >
            <span className="sidebar-forum-label">
              {forum.name}{' '}
              <span className="sidebar-forum-count">{forum.commentCount}</span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
