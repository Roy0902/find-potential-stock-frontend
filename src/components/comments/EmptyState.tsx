import { StateMessage } from '@/components/common/StateMessage';
import { en } from '@/locales/en';

export function EmptyState() {
  return (
    <StateMessage>
      <p className="m-0 text-base font-bold text-foreground">{en.comments.emptyTitle}</p>
      <p className="m-0 text-muted-foreground">{en.comments.emptyHint}</p>
    </StateMessage>
  );
}
