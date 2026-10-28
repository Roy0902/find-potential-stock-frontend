import type { AdminAction } from '@/types';
import { formatTime } from '@/lib/format';
import { en } from '@/locales/en';

export function ActionLog({ actions }: { actions: AdminAction[] }) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0 [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-2 [&>li]:rounded-sm [&>li]:border [&>li]:border-border [&>li]:bg-white [&>li]:px-3 [&>li]:py-2.5 [&>li]:text-sm">
      {actions.map((action) => (
        <li key={action.id}>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-secondary-foreground">
            {action.action}
          </span>
          <span className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {en.admin.actionTarget(action.targetType, action.targetId)}
            </span>
            <time dateTime={action.createdAt}>{formatTime(action.createdAt)}</time>
          </span>
        </li>
      ))}
    </ul>
  );
}
