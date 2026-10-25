import type { Author, CommentSummary } from './comment';

export type AdminComment = Omit<CommentSummary, 'author'> & {
  author: Author & { id: number };
  isHidden: boolean;
  hiddenReason: string | null;
};

export type AdminAction = {
  id: number;
  action: string;
  targetType: string;
  targetId: number;
  createdAt: string;
};

export type ScrapeRun = {
  id: number;
  mode: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  commentsAdded: number;
  commentsUpdated: number;
  commentsSkippedRestricted: number;
};

export type BlockedAuthor = {
  id: number;
  displayName: string;
  externalId: string;
  isBlocked: boolean;
};

export type PendingAction =
  | { kind: 'hide' | 'delete' | 'block'; commentId: number }
  | { kind: 'unblock'; authorId: number };
