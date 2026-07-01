import type { StoreProduct } from '@features/home/types/home.types';

const productLabelAliases: Record<string, string[]> = {
  apples: ['apple', 'fruit'],
  bananas: ['banana', 'fruit', 'tropical'],
  bread: ['bread', 'bakery', 'loaf'],
  chicken: ['chicken', 'meat'],
  coffee: ['coffee', 'beverage', 'drink'],
  'leafy greens': ['leafy', 'greens', 'vegetable', 'spinach', 'romaine', 'kale'],
  milk: ['milk', 'dairy'],
  rice: ['rice', 'pantry'],
  tomatoes: ['tomato', 'vegetable'],
  yogurt: ['yogurt', 'dairy'],
};

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getProductMatchTerms = (label: string) => {
  const normalizedLabel = normalizeSearchText(label);
  const singularLabel = normalizedLabel.replace(/s\b/g, '');
  const aliases = productLabelAliases[normalizedLabel] ?? [];

  return Array.from(new Set([normalizedLabel, singularLabel, ...aliases].filter(Boolean)));
};

export const productMatchesHighlight = (product: StoreProduct, label: string) => {
  const terms = getProductMatchTerms(label);
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const badges = Array.isArray(product.badges) ? product.badges : [];
  const productText = normalizeSearchText(
    [
      product.name ?? '',
      product.description ?? '',
      product.origin ?? '',
      product.unit ?? '',
      product.slug ?? '',
      product.sku ?? '',
      tags.join(' '),
      badges.map((badge) => badge.label).join(' '),
    ].join(' '),
  );

  return terms.some((term) => productText.includes(term));
};
