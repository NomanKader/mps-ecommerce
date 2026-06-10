import type {
  StorefrontCarouselPlacement,
  StorefrontCarouselSlide,
} from '@features/home/types/home.types';

export const carouselStorageKey = 'mps-ecommerce.storefront-carousel-slides';

const placements: StorefrontCarouselPlacement[] = ['hero', 'showcase'];

const isPlacement = (value: unknown): value is StorefrontCarouselPlacement =>
  typeof value === 'string' && placements.includes(value as StorefrontCarouselPlacement);

const isSlide = (value: unknown): value is StorefrontCarouselSlide => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const slide = value as Partial<StorefrontCarouselSlide>;

  return (
    typeof slide.cta === 'string' &&
    typeof slide.description === 'string' &&
    typeof slide.eyebrow === 'string' &&
    typeof slide.headline === 'string' &&
    typeof slide.id === 'string' &&
    typeof slide.imageUrl === 'string' &&
    typeof slide.metric === 'string' &&
    typeof slide.partner === 'string' &&
    isPlacement(slide.placement) &&
    typeof slide.sortOrder === 'number' &&
    typeof slide.startsAt === 'string' &&
    (slide.status === 'active' || slide.status === 'draft' || slide.status === 'scheduled') &&
    typeof slide.targetCategoryId === 'string' &&
    (typeof slide.targetSearch === 'string' || typeof slide.targetSearch === 'undefined') &&
    typeof slide.title === 'string'
  );
};

export const readCarouselSlides = (fallbackSlides: StorefrontCarouselSlide[]) => {
  if (typeof window === 'undefined') {
    return fallbackSlides;
  }

  const stored = window.localStorage.getItem(carouselStorageKey);

  if (!stored) {
    return fallbackSlides;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (Array.isArray(parsed) && parsed.every(isSlide)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(carouselStorageKey);
  }

  return fallbackSlides;
};

export const writeCarouselSlides = (slides: StorefrontCarouselSlide[]) => {
  window.localStorage.setItem(carouselStorageKey, JSON.stringify(slides));
};

export const resetCarouselSlides = () => {
  window.localStorage.removeItem(carouselStorageKey);
};

export const getActiveCarouselSlides = (
  slides: StorefrontCarouselSlide[],
  placement: StorefrontCarouselPlacement,
) => {
  const today = new Date();

  return slides
    .filter((slide) => {
      if (slide.placement !== placement || slide.status !== 'active') {
        return false;
      }

      if (!slide.startsAt) {
        return true;
      }

      return new Date(`${slide.startsAt}T00:00:00`) <= today;
    })
    .sort((first, second) => first.sortOrder - second.sortOrder);
};
