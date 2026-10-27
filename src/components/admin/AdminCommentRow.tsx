import type { AdminComment } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';

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
    <li>
      <div className="admin-row-main">
        <div className="admin-row-meta">
          <span className="comment-author">{formatAuthor(comment.author)}</span>
          <span>{comment.sourceName}</span>
          <time dateTime={comment.postedAt}>{formatTime(comment.postedAt)}</time>
          {comment.isHidden ? <span className="badge badge--hidden">Hidden</span> : null}
          {comment.author.isBlocked ? (
            <span className="badge badge--blocked">Blocked</span>
          ) : null}
        </div>
        <p className="admin-row-excerpt">{comment.excerpt}</p>
      </div>
      <div className="admin-row-actions">
        <button type="button" onClick={onToggleHidden} disabled={pending}>
          {comment.isHidden ? 'Unhide' : 'Hide'}
        </button>
        <button type="button" onClick={onDelete} disabled={pending}>
          Delete
        </button>
        <button type="button" onClick={onBlock} disabled={comment.author.isBlocked || pending}>
          Block
        </button>
      </div>
    </li>
  );
}
