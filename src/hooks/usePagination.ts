import { useMemo, useState } from 'react';

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage,
      setPageSize,
    }),
    [page, pageSize],
  );
};
