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
    <div role="dialog" aria-modal="true" className="dialog">
      <p>{message}</p>
      <button type="button" onClick={onConfirm} disabled={busy}>
        Confirm
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
