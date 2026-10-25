import type { CommentSummary } from '@/types';
import { CommentCard } from './CommentCard';

export function CommentGrid({ comments }: { comments: CommentSummary[] }) {
  return (
    <ul aria-label="Comments" className="grid" aria-live="polite">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </ul>
  );
}
