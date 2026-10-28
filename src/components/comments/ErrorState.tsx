import { StateMessage } from '@/components/common/StateMessage';
import { Button } from '@/components/ui/button';
import { en } from '@/locales/en';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateMessage tone="error">
      <p className="m-0 text-base font-bold text-foreground">{en.comments.error}</p>
      <Button type="button" className="mt-2" onClick={onRetry}>
        {en.comments.retry}
      </Button>
    </StateMessage>
  );
}
