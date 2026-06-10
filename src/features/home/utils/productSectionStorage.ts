import type {
  StoreProduct,
  StorefrontProductSectionAssignment,
  StorefrontProductSectionId,
} from '@features/home/types/home.types';

export const productSectionStorageKey = 'mps-ecommerce.storefront-product-sections';

const sectionIds: StorefrontProductSectionId[] = [
  'top-offers',
  'top-blooms',
  'new-season',
  'pantry-ready',
];

const isSectionId = (value: unknown): value is StorefrontProductSectionId =>
  typeof value === 'string' && sectionIds.includes(value as StorefrontProductSectionId);

const isAssignment = (value: unknown): value is StorefrontProductSectionAssignment => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const assignment = value as Partial<StorefrontProductSectionAssignment>;

  return (
    typeof assignment.id === 'string' &&
    typeof assignment.productId === 'string' &&
    isSectionId(assignment.sectionId) &&
    typeof assignment.sortOrder === 'number' &&
    (assignment.status === 'active' || assignment.status === 'hidden')
  );
};

export const readProductSectionAssignments = (
  fallbackAssignments: StorefrontProductSectionAssignment[],
) => {
  if (typeof window === 'undefined') {
    return fallbackAssignments;
  }

  const stored = window.localStorage.getItem(productSectionStorageKey);

  if (!stored) {
    return fallbackAssignments;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (Array.isArray(parsed) && parsed.every(isAssignment)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(productSectionStorageKey);
  }

  return fallbackAssignments;
};

export const writeProductSectionAssignments = (
  assignments: StorefrontProductSectionAssignment[],
) => {
  window.localStorage.setItem(productSectionStorageKey, JSON.stringify(assignments));
};

export const resetProductSectionAssignments = () => {
  window.localStorage.removeItem(productSectionStorageKey);
};

export const getSectionProducts = (
  assignments: StorefrontProductSectionAssignment[],
  products: StoreProduct[],
  sectionId: StorefrontProductSectionId,
) =>
  assignments
    .filter((assignment) => assignment.sectionId === sectionId && assignment.status === 'active')
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((assignment) => products.find((product) => product.id === assignment.productId))
    .filter((product): product is StoreProduct => Boolean(product));
