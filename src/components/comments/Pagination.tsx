import { Button } from '@/components/ui/button';
import { en } from '@/locales/en';

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm max-[767px]:flex-col max-[767px]:items-stretch">
      <p className="m-0 text-xs font-semibold tabular-nums text-muted-foreground" aria-live="polite">
        {en.pagination.status(page, totalPages)}
      </p>
      <div className="flex gap-2 max-[767px]:[&>button]:flex-1">
        <Button variant="outline" type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          {en.pagination.previous}
        </Button>
        <Button variant="outline" type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
          {en.pagination.next}
        </Button>
      </div>
    </div>
  );
}
