export type Author = {
  displayName: string;
  externalId: string;
  isBlocked: boolean;
};

export type CommentSummary = {
  id: number;
  body: string;
  postedAt: string;
  url: string;
  threadId: number;
  threadTitle: string;
  sourceName: string;
  author: Author;
  parentId: number | null;
  replyTargetUnknown: boolean;
  excerpt: string;
};
