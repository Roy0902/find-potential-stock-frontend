import type { CommentNode } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';

export function ThreadComment({
  node,
  highlighted,
}: {
  node: CommentNode;
  highlighted: number | null;
}) {
  const labelled = node.parentMissing || node.replyTargetUnknown;
  return (
    <article
      aria-label={formatAuthor(node.author)}
      aria-current={node.id === highlighted ? 'true' : undefined}
      data-posted-at={node.postedAt}
      className="comment"
    >
      <header>
        <span className="comment-author">{formatAuthor(node.author)}</span>{' '}
        <time dateTime={node.postedAt}>{formatTime(node.postedAt)}</time>
      </header>
      {labelled ? <p className="comment-label">Replying to an earlier comment,</p> : null}
      <p className="comment-body" lang={node.lang ?? undefined}>
        {node.body}
      </p>
      <a href={node.url}>View original post</a>
      {node.collapsed ? (
        <a href={node.url} className="collapsed-link">
          View on source site
        </a>
      ) : null}
      {node.children.length > 0 ? (
        <div className="replies">
          {node.children.map((child) => (
            <ThreadComment key={child.id} node={child} highlighted={highlighted} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
