export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

// [UTIL] Parse and normalize pagination query
export const parsePagination = (
  query: PaginationQuery,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationResult => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || defaultLimit;

  if (page < 1) page = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
};

// [UTIL] Build pagination meta for response
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  return { page, limit, total };
};