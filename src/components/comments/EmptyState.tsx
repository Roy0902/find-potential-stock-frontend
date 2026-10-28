import { StateMessage } from '@/components/common/StateMessage';

export function EmptyState() {
  return (
    <StateMessage>
      <p className="m-0 text-base font-bold text-foreground">No comments match your search,</p>
      <p className="m-0 text-muted-foreground">Try a different keyword or a stock name.</p>
    </StateMessage>
  );
}
