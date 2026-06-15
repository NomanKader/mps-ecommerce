const routeLabelOverrides: Record<string, string> = {
  'admin-user': 'User',
};

export const createRouteLabel = (pathname: string): string => {
  const routeKey = pathname.split('/').filter(Boolean).at(-1);

  if (!routeKey) {
    return 'Dashboard';
  }

  return (
    routeLabelOverrides[routeKey] ??
    routeKey.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
  );
};
