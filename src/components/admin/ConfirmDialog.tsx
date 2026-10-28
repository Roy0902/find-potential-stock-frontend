import { Button } from '@/components/ui/button';

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  busy = false,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] m-auto grid h-fit w-[min(22rem,calc(100vw-2rem))] gap-3 rounded-xl border border-border bg-card p-5 shadow-[0_0_0_100vmax_rgba(18,33,44,0.42),0_12px_32px_rgba(18,33,44,0.1)]"
    >
      <p className="mb-1 font-bold">{message}</p>
      <Button variant="destructive" type="button" onClick={onConfirm} disabled={busy}>
        Confirm
      </Button>
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
