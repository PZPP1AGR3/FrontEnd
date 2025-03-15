export interface Pagination {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
