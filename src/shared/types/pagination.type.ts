export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
};
