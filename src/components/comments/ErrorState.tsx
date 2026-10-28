import { StateMessage } from '@/components/common/StateMessage';
import { Button } from '@/components/ui/button';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateMessage tone="error">
      <p className="m-0 text-base font-bold text-foreground">Something went wrong.</p>
      <Button type="button" className="mt-2" onClick={onRetry}>
        Retry
      </Button>
    </StateMessage>
  );
}
