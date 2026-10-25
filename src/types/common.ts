export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paged<T> = {
  comments: T[];
  pagination: Pagination;
};
