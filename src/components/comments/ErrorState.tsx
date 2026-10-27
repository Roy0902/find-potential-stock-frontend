import { StateMessage } from '@/components/common/StateMessage';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateMessage tone="error">
      <p>Something went wrong.</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </StateMessage>
  );
}
