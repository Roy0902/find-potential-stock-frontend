import type { CommentSummary } from '@/types';
import { CommentCard } from './CommentCard';

export function CommentGrid({ comments }: { comments: CommentSummary[] }) {
  return (
    <ul
      aria-label="Comments"
      className="m-0 grid list-none grid-cols-3 gap-[1.15rem] p-0 max-[1100px]:grid-cols-2 max-[1023px]:grid-cols-2 max-[767px]:grid-cols-1"
      aria-live="polite"
    >
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </ul>
  );
}
