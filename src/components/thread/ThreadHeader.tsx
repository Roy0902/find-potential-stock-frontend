import type { ThreadMeta } from '@/types';

export function ThreadHeader({ thread }: { thread: ThreadMeta }) {
  return (
    <header className="thread-header">
      <h1>{thread.title}</h1>
      <p>{thread.sourceName}</p>
      <a href={thread.sourceUrl}>View thread on source site</a>
    </header>
  );
}
