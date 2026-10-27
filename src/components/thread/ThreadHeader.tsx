import { Link } from 'react-router-dom';
import type { ThreadMeta } from '@/types';

export function ThreadHeader({ thread }: { thread: ThreadMeta }) {
  return (
    <>
      <Link to="/" className="back-link">
        Back to archive
      </Link>
      <header className="thread-header">
        <p className="eyebrow">Thread</p>
        <h1>{thread.title}</h1>
        <div className="thread-meta">
          <span className="source-pill">{thread.sourceName}</span>
          <a className="source-link" href={thread.sourceUrl}>
            View thread on source site
          </a>
        </div>
      </header>
    </>
  );
}
