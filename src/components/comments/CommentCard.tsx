import { Link } from 'react-router-dom';
import type { CommentSummary } from '@/types';
import { formatAuthor, formatTime } from '@/lib/format';

export function CommentCard({ comment }: { comment: CommentSummary }) {
  return (
    <li className="card">
      <Link to={`/comments/${comment.id}`}>
        <span className="card-thread">{comment.threadTitle}</span>
        <p className="card-excerpt">{comment.excerpt}</p>
        <span className="card-author">{formatAuthor(comment.author)}</span>
        <time dateTime={comment.postedAt}>{formatTime(comment.postedAt)}</time>
        <span className="card-source">{comment.sourceName}</span>
      </Link>
    </li>
  );
}
