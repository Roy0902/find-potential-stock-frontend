import type { AdminComment } from '@/types';
import { formatAuthor } from '@/lib/format';

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
      <span className="comment-author">{formatAuthor(comment.author)}</span>{' '}
      <span>{comment.excerpt}</span>{' '}
      {comment.isHidden ? <span className="badge">Hidden</span> : null}{' '}
      {comment.author.isBlocked ? <span className="badge">Blocked</span> : null}{' '}
      <button type="button" onClick={onToggleHidden} disabled={pending}>
        {comment.isHidden ? 'Unhide' : 'Hide'}
      </button>
      <button type="button" onClick={onDelete} disabled={pending}>
        Delete
      </button>
      <button type="button" onClick={onBlock} disabled={comment.author.isBlocked || pending}>
        Block
      </button>
    </li>
  );
}
