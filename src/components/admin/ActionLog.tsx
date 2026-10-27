import type { AdminAction } from '@/types';
import { formatTime } from '@/lib/format';

export function ActionLog({ actions }: { actions: AdminAction[] }) {
  return (
    <ul>
      {actions.map((action) => (
        <li key={action.id}>
          <span className="badge">{action.action}</span>
          <span className="scrape-meta">
            <span>
              {action.targetType} #{action.targetId}
            </span>
            <time dateTime={action.createdAt}>{formatTime(action.createdAt)}</time>
          </span>
        </li>
      ))}
    </ul>
  );
}
