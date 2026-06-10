export type StoreCategory = {
  color: string;
  icon: string;
  id: string;
  label: string;
};

export type StoreCategoryMenuItem = {
  icon: string;
  label: string;
};

export type FeatureHighlight = {
  color: string;
  icon: string;
  id: string;
  label: string;
  sortOrder?: number;
  status?: 'active' | 'hidden';
  surfaceColor?: string;
  textColor?: string;
};

export type StorefrontHighlightSection = 'featured' | 'merchandising';

export type StorefrontHighlightItem = FeatureHighlight & {
  section: StorefrontHighlightSection;
  sortOrder: number;
  status: 'active' | 'hidden';
  targetCategoryId: string;
  targetSearch?: string;
};

export type StorefrontProductSectionId =
  | 'top-offers'
  | 'top-blooms'
  | 'new-season'
  | 'pantry-ready';

export type StorefrontProductSection = {
  description: string;
  id: StorefrontProductSectionId;
  title: string;
};

export type StorefrontProductSectionAssignment = {
  id: string;
  productId: string;
  sectionId: StorefrontProductSectionId;
  sortOrder: number;
  status: 'active' | 'hidden';
};

export type PromoTile = {
  accent: string;
  cta: string;
  id: string;
  imageUrl: string;
  targetCategoryId: string;
  targetSearch?: string;
  title: string;
};

export type ShopBrand = {
  color: string;
  id: string;
  label: string;
  textColor?: string;
};

export type StoreProductBadge = {
  color: string;
  label: string;
};

export type StoreProduct = {
  badges: StoreProductBadge[];
  categoryId: string;
  currency: string;
  description: string;
  id: string;
  imageUrl: string;
  inventory: number;
  name: string;
  origin: string;
  price: number;
  rating: number;
  sku: string;
  slug: string;
  tags: string[];
  tenantId: string;
  unit: string;
};

export type HeroBannerContent = {
  cta: string;
  description: string;
  eyebrow: string;
  imageUrl: string;
  title: string;
};

export type ShowcaseBanner = {
  description: string;
  id: string;
  imageUrl: string;
  title: string;
};

export type StorefrontCarouselPlacement = 'hero' | 'showcase';

export type StorefrontCarouselSlide = {
  cta: string;
  description: string;
  eyebrow: string;
  headline: string;
  id: string;
  imageUrl: string;
  metric: string;
  partner: string;
  placement: StorefrontCarouselPlacement;
  sortOrder: number;
  startsAt: string;
  status: 'active' | 'draft' | 'scheduled';
  targetCategoryId: string;
  targetSearch?: string;
  title: string;
};

export type FooterLinkGroup = {
  id: string;
  links: string[];
  title: string;
};
