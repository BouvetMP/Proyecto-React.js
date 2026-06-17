export function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const defaultSize = Number(process.env.DEFAULT_PAGE_SIZE || 30);
  const maxSize = Number(process.env.MAX_PAGE_SIZE || 200);
  const pageSize = Math.min(Math.max(Number(query.pageSize || defaultSize), 1), maxSize);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

export function paginationMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
}
