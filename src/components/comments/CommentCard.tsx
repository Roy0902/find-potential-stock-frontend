import { Link } from 'react-router-dom';
import type { CommentSummary } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';

export function CommentCard({ comment }: { comment: CommentSummary }) {
  const initial = comment.author.displayName.trim().slice(0, 1).toLocaleUpperCase() || '?';

  return (
    <li className="card">
      <Link to={`/comments/${comment.id}`}>
        <span className="card-topline">
          <span className="card-thread">{comment.threadTitle}</span>
          <span className="card-source">{comment.sourceName}</span>
        </span>
        <p className="card-excerpt">{comment.excerpt}</p>
        <span className="card-footer">
          <span className="avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="card-identity">
            <span className="card-author">{formatAuthor(comment.author)}</span>
            <time dateTime={comment.postedAt}>{formatTime(comment.postedAt)}</time>
          </span>
        </span>
      </Link>
    </li>
  );
}
