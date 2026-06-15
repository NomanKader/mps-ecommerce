import type {
  StorefrontHighlightItem,
  StorefrontHighlightSection,
} from '@features/home/types/home.types';

export const highlightStorageKey = 'mps-ecommerce.storefront-highlight-items';

const sections: StorefrontHighlightSection[] = ['featured', 'merchandising'];

const isSection = (value: unknown): value is StorefrontHighlightSection =>
  typeof value === 'string' && sections.includes(value as StorefrontHighlightSection);

const isHighlightItem = (value: unknown): value is StorefrontHighlightItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<StorefrontHighlightItem>;

  return (
    typeof item.color === 'string' &&
    typeof item.icon === 'string' &&
    typeof item.id === 'string' &&
    typeof item.label === 'string' &&
    isSection(item.section) &&
    (item.status === 'active' || item.status === 'hidden') &&
    (typeof item.surfaceColor === 'string' || typeof item.surfaceColor === 'undefined') &&
    (typeof item.textColor === 'string' || typeof item.textColor === 'undefined')
  );
};

export const readHighlightItems = (fallbackItems: StorefrontHighlightItem[]) => {
  if (typeof window === 'undefined') {
    return fallbackItems;
  }

  const stored = window.localStorage.getItem(highlightStorageKey);

  if (!stored) {
    return fallbackItems;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (Array.isArray(parsed) && parsed.every(isHighlightItem)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(highlightStorageKey);
  }

  return fallbackItems;
};

export const writeHighlightItems = (items: StorefrontHighlightItem[]) => {
  window.localStorage.setItem(highlightStorageKey, JSON.stringify(items));
};

export const resetHighlightItems = () => {
  window.localStorage.removeItem(highlightStorageKey);
};

export const getActiveHighlightItems = (
  items: StorefrontHighlightItem[],
  section: StorefrontHighlightSection,
) => items.filter((item) => item.section === section && item.status === 'active');
