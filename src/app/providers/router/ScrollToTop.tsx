import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { hash, pathname, search } = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ behavior: 'auto', left: 0, top: 0 });
  }, [hash, pathname, search]);

  return null;
};
