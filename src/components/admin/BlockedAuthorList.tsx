import type { BlockedAuthor } from '@/types';
import { formatAuthor } from '@/lib/format';

export function BlockedAuthorList({
  authors,
  pendingAuthorId,
  onUnblock,
}: {
  authors: BlockedAuthor[];
  pendingAuthorId: number | null;
  onUnblock: (id: number) => void;
}) {
  return (
    <ul>
      {authors.map((entry) => (
        <li key={entry.id}>
          <span className="comment-author">{formatAuthor(entry)}</span>{' '}
          <button
            type="button"
            onClick={() => onUnblock(entry.id)}
            disabled={pendingAuthorId === entry.id}
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}
