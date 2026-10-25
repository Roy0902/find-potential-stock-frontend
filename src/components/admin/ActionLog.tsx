import type { AdminAction } from '@/types';
import { formatTime } from '@/lib/format';

export function ActionLog({ actions }: { actions: AdminAction[] }) {
  return (
    <ul>
      {actions.map((action) => (
        <li key={action.id}>
          <span>{action.action}</span> <span>{action.targetType}</span>{' '}
          <span>{action.targetId}</span> <time>{formatTime(action.createdAt)}</time>
        </li>
      ))}
    </ul>
  );
}
