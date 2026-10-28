import type { CommentNode } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ThreadComment({
  node,
  highlighted,
}: {
  node: CommentNode;
  highlighted: number | null;
}) {
  const labelled = node.parentMissing || node.replyTargetUnknown;
  const initial = node.author.displayName.trim().slice(0, 1).toLocaleUpperCase() || '?';

  return (
    <article
      aria-label={formatAuthor(node.author)}
      aria-current={node.id === highlighted ? 'true' : undefined}
      data-posted-at={node.postedAt}
      className={cn(
        'my-0 [overflow-wrap:anywhere] rounded-[10px] border border-l-[3px] border-input bg-card p-4 shadow-sm [&>header]:mb-2 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:gap-2 [&>header]:text-xs [&>header]:text-muted-foreground [&>header>time]:tabular-nums [&>a]:inline-flex [&>a]:min-h-8 [&>a]:items-center [&>a]:text-xs [&>a]:font-semibold [&>a]:text-accent-foreground [&>a]:no-underline [&>a:hover]:underline max-[480px]:px-3',
        node.id === highlighted && 'border-l-primary bg-[#f4fafb] shadow-[0_0_0_3px_rgba(15,92,112,0.1),0_1px_2px_rgba(18,33,44,0.06)]',
      )}
    >
      <header>
        <span className="grid size-[1.85rem] flex-none place-items-center rounded-full bg-muted text-xs font-extrabold text-accent-foreground" aria-hidden="true">
          {initial}
        </span>
        <span className="text-[0.81rem] font-bold text-secondary-foreground">{formatAuthor(node.author)}</span>{' '}
        <time dateTime={node.postedAt}>{formatTime(node.postedAt)}</time>
      </header>
      {labelled ? <p className="mb-2 text-xs italic text-muted-foreground">Replying to an earlier comment,</p> : null}
      <p className="mb-2.5 whitespace-pre-wrap text-[0.94rem] leading-7 text-foreground [overflow-wrap:anywhere]" lang={node.lang ?? undefined}>
        {node.body}
      </p>
      <a href={node.url}>View original post</a>
      {node.collapsed ? (
        <a href={node.url} className="ml-3">
          View on source site
        </a>
      ) : null}
      {node.children.length > 0 ? (
        <div className="ml-1 mt-4 grid gap-3 border-l border-input pl-4 max-[767px]:ml-0 max-[767px]:pl-3 max-[480px]:pl-2">
          {node.children.map((child) => (
            <ThreadComment key={child.id} node={child} highlighted={highlighted} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
