export const toPagination = (page = 1, limit = 20) => ({
  skip: (page - 1) * limit,
  limit
});
