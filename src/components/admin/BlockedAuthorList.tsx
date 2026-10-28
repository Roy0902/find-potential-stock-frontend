import type { BlockedAuthor } from '@/types';
import { formatAuthor } from '@/lib/format';
import { Button } from '@/components/ui/button';

export function BlockedAuthorList({
  authors,
  pendingAuthorId,
  onUnblock,
}: {
  authors: BlockedAuthor[];
  pendingAuthorId: number | null;
  onUnblock: (id: number) => void;
}) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0 [&>li]:flex [&>li]:flex-wrap [&>li]:items-center [&>li]:justify-between [&>li]:gap-2 [&>li]:rounded-sm [&>li]:border [&>li]:border-border [&>li]:bg-white [&>li]:px-3 [&>li]:py-2.5 [&>li]:text-sm">
      {authors.map((entry) => (
        <li key={entry.id}>
          <span className="text-[0.81rem] font-bold text-secondary-foreground">
            {formatAuthor(entry)}
          </span>{' '}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onUnblock(entry.id)}
            disabled={pendingAuthorId === entry.id}
          >
            Unblock
          </Button>
        </li>
      ))}
    </ul>
  );
}
