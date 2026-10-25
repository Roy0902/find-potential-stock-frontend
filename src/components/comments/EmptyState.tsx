import { StateMessage } from '@/components/common/StateMessage';

export function EmptyState() {
  return (
    <StateMessage>
      <p>No comments match your search,</p>
      <p>Try a different keyword or a stock name.</p>
    </StateMessage>
  );
}
