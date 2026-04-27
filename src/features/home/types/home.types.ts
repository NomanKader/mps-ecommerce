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
  surfaceColor?: string;
  textColor?: string;
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

export type FooterLinkGroup = {
  id: string;
  links: string[];
  title: string;
};
