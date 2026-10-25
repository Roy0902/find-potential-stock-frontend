import type { CommentSummary } from './comment';
import type { Pagination } from './common';

export type CommentNode = {
  id: number;
  parentId: number | null;
  parentMissing: boolean;
  replyTargetUnknown: boolean;
  body: string;
  postedAt: string;
  url: string;
  lang: string | null;
  author: Omit<CommentSummary['author'], 'isBlocked'>;
  depth: number;
  collapsed: boolean;
  children: CommentNode[];
};

export type ThreadMeta = {
  id: number;
  title: string;
  sourceName: string;
  sourceUrl: string;
};

export type ThreadPageData = {
  thread: ThreadMeta;
  highlightedCommentId: number | null;
  comments: CommentNode[];
  topLevel: Pagination;
};
