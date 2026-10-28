import type { AdminComment } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';
import { Button } from '@/components/ui/button';

export function AdminCommentRow({
  comment,
  pending,
  onToggleHidden,
  onDelete,
  onBlock,
}: {
  comment: AdminComment;
  pending: boolean;
  onToggleHidden: () => void;
  onDelete: () => void;
  onBlock: () => void;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 rounded-sm border border-border bg-[#fbfdfd] p-3.5 max-[767px]:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-[0.72rem] text-muted-foreground">
          <span className="text-[0.81rem] font-bold text-secondary-foreground">
            {formatAuthor(comment.author)}
          </span>
          <span>{comment.sourceName}</span>
          <time dateTime={comment.postedAt}>{formatTime(comment.postedAt)}</time>
          {comment.isHidden ? (
            <span className="rounded-full bg-[#fffaeb] px-2 py-0.5 text-[0.66rem] font-bold uppercase text-[#b54708]">
              Hidden
            </span>
          ) : null}
          {comment.author.isBlocked ? (
            <span className="rounded-full bg-[#fef3f2] px-2 py-0.5 text-[0.66rem] font-bold uppercase text-[#b42318]">
              Blocked
            </span>
          ) : null}
        </div>
        <p className="m-0 text-sm leading-relaxed text-secondary-foreground">{comment.excerpt}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2 max-[767px]:justify-start">
        <Button variant="outline" size="sm" type="button" onClick={onToggleHidden} disabled={pending}>
          {comment.isHidden ? 'Unhide' : 'Hide'}
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={onDelete} disabled={pending}>
          Delete
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={onBlock} disabled={comment.author.isBlocked || pending}>
          Block
        </Button>
      </div>
    </li>
  );
}
