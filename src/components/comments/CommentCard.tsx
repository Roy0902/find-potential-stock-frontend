import { Link } from 'react-router';
import type { CommentSummary } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';

export function CommentCard({ comment }: { comment: CommentSummary }) {
  const initial = comment.author.displayName.trim().slice(0, 1).toLocaleUpperCase() || '?';

  return (
    <li className="min-w-0">
      <Link
        to={`/comments/${comment.id}`}
        className="group flex h-full min-h-[11.25rem] flex-col gap-3.5 rounded-xl border border-border bg-card px-5 py-4 shadow-sm text-inherit no-underline transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[#b9cbd3] hover:text-inherit hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="order-1 line-clamp-1 min-w-0 flex-1 text-xs font-semibold leading-tight text-muted-foreground">
            {comment.threadTitle}
          </span>
          <span className="order-[-1] flex-none rounded-full bg-accent px-2 py-0.5 text-[0.64rem] font-extrabold uppercase tracking-wider text-accent-foreground">
            {comment.sourceName}
          </span>
        </span>
        <p className="m-0 line-clamp-4 [overflow-wrap:anywhere] text-[0.94rem] leading-relaxed text-foreground">
          {comment.excerpt}
        </p>
        <span className="mt-auto flex items-center gap-2.5 border-t border-border pt-3.5">
          <span
            className="grid size-[1.85rem] flex-none place-items-center rounded-full bg-muted text-xs font-extrabold text-accent-foreground"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="flex min-w-0 flex-col gap-px">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-secondary-foreground">
              {formatAuthor(comment.author)}
            </span>
            <time className="text-[0.71rem] tabular-nums text-muted-foreground" dateTime={comment.postedAt}>
              {formatTime(comment.postedAt)}
            </time>
          </span>
        </span>
      </Link>
    </li>
  );
}
