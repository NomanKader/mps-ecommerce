export const createRouteLabel = (pathname: string): string =>
  pathname
    .split('/')
    .filter(Boolean)
    .at(-1)
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase()) ?? 'Dashboard';
