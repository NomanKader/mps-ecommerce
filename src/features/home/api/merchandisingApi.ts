import { apiClient } from '@shared/api/axios';
import type { Category } from '@entities/category/types/category.types';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';
import type { User } from '@entities/user/types/user.types';
import type {
  StoreProduct,
  StorefrontCarouselPlacement,
  StorefrontCarouselSlide,
  StorefrontHighlightItem,
  StorefrontHighlightSection,
  StorefrontPageSegment,
  StorefrontPageSegmentSlide,
  StorefrontProductSection,
  StorefrontProductSectionAssignment,
  StorefrontSecondaryCategory,
} from '@features/home/types/home.types';

type MongoEntity = { _id: string };
type BackendEntity<T extends { id: string }> = Omit<T, 'id'> & MongoEntity;
type BackendCategory = Omit<Category, 'id' | 'subcategories'> &
  MongoEntity & {
    subcategories?: string[];
  };
type BackendStoreProduct = Omit<Partial<StoreProduct>, 'id' | 'inventory'> &
  MongoEntity & {
    categoryName?: string;
    description?: string;
    imageUrl?: string | null;
    stock?: number;
    subcategory?: string;
  };
type ListOptions = { signal?: globalThis.AbortSignal };
type Query = Record<string, string | undefined>;

export type HeaderSettings = {
  deliveryHeadline: string;
  logoUrl?: string;
  supportPhoneCountryCode: string;
  supportPhoneNumber: string;
  topBarTagline: string;
};

export type AdminProfile = {
  admin: User;
  headerSettings: HeaderSettings;
};

export type AdminProfilePayload = {
  deliveryHeadline: string;
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  logoUrl?: string;
  password?: string;
  passwordConfirmation?: string;
  supportPhoneCountryCode: string;
  supportPhoneNumber: string;
  topBarTagline: string;
};

export type CarouselPayload = Omit<StorefrontCarouselSlide, 'id' | 'imageUrl'> & {
  image?: File;
  removeImage?: boolean;
};

export type StorefrontProductSectionResponse = {
  sections: Array<StorefrontProductSection & { products: StoreProduct[] }>;
};

export type AdminSectionProduct = StoreProduct & {
  assignmentId?: string;
  sectionAssignmentId?: string;
  sortOrder?: number;
  status?: 'active' | 'hidden';
};

export type AdminProductSectionResponse = {
  sections: Array<StorefrontProductSection & { products: AdminSectionProduct[] }>;
};

export type ProductSectionAssignmentPayload = Omit<StorefrontProductSectionAssignment, 'id'>;

export type PageSegmentDetailResponse = {
  allProducts: StoreProduct[];
  category: Category | null;
  newProducts: StoreProduct[];
  segment: StorefrontPageSegment;
  subcategories: string[];
  topOffers: StoreProduct[];
};

type PageSegmentSlidePayload = Omit<StorefrontPageSegmentSlide, 'imageUrl'> & {
  image?: File | null;
  removeImage?: boolean;
};

export type PageSegmentPayload = Omit<
  StorefrontPageSegment,
  'id' | 'imageUrl' | 'topCarousel' | 'afterNewProductsCarousel' | 'haveYouSeenCards'
> & {
  afterNewProductsCarousel: PageSegmentSlidePayload[];
  haveYouSeenCards: PageSegmentSlidePayload[];
  image?: File | null;
  removeImage?: boolean;
  topCarousel: PageSegmentSlidePayload[];
};

const mapId = <T extends MongoEntity>({ _id, ...entity }: T) => ({ ...entity, id: _id });
const params = (query: Query) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value && value !== 'all'));

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const mapCategory = ({ _id, subcategories = [], ...category }: BackendCategory): Category => ({
  ...category,
  id: _id,
  subcategories: subcategories.map((subcategory) => ({
    icon: category.icon ?? '',
    id: `${_id}-${slugify(subcategory)}`,
    name: subcategory,
    slug: slugify(subcategory),
  })),
});

const normalizeEntity = <T extends { id: string }>(entity: T | BackendEntity<T>) => {
  if ('_id' in entity) {
    return mapId(entity as BackendEntity<T>) as unknown as T;
  }

  return entity as T;
};

const normalizeProductSections = <
  T extends StorefrontProductSectionResponse | AdminProductSectionResponse,
>(
  response: T,
) => ({
  ...response,
  sections: response.sections.map((section) => ({
    ...section,
    products: section.products.map((product) =>
      normalizeEntity(product as typeof product | BackendEntity<typeof product>),
    ),
  })),
});

const normalizeSecondaryCategory = (
  category: StorefrontSecondaryCategory | BackendEntity<StorefrontSecondaryCategory>,
): StorefrontSecondaryCategory => {
  const normalizedCategory = normalizeEntity(category);
  const productIds = normalizedCategory.productIds?.length
    ? normalizedCategory.productIds
    : normalizedCategory.productId
      ? [normalizedCategory.productId]
      : [];

  return {
    ...normalizedCategory,
    productId: normalizedCategory.productId ?? productIds[0],
    productIds,
  };
};

const normalizeStoreProduct = ({ _id, stock, subcategory, categoryName, ...product }: BackendStoreProduct): StoreProduct => ({
  badges: product.badges ?? [],
  categoryId: product.categoryId ?? 'all',
  currency: product.currency ?? 'MMK',
  description: product.description ?? '',
  id: _id,
  imageUrl: product.imageUrl ?? '',
  inventory: stock ?? 0,
  name: product.name ?? '',
  origin: product.origin ?? categoryName ?? subcategory ?? '',
  price: product.price ?? 0,
  rating: product.rating ?? 0,
  sku: product.sku ?? '',
  slug: product.slug ?? slugify(product.name ?? _id),
  tags: product.tags ?? [],
  tenantId: product.tenantId ?? '',
  unit: product.unit ?? subcategory ?? 'item',
});

const carouselFormData = (payload: CarouselPayload) => {
  const formData = new FormData();
  const appendIfPresent = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  };

  formData.append('placement', payload.placement);
  appendIfPresent('title', payload.title);
  appendIfPresent('description', payload.description);
  appendIfPresent('eyebrow', payload.eyebrow);
  appendIfPresent('cta', payload.cta);
  appendIfPresent('metric', payload.metric);
  appendIfPresent('headline', payload.headline);
  appendIfPresent('partner', payload.partner);
  appendIfPresent('targetCategoryId', payload.targetCategoryId);
  formData.append('sortOrder', String(payload.sortOrder));
  formData.append('status', payload.status);
  appendIfPresent('startsAt', payload.startsAt);

  appendIfPresent('targetSearch', payload.targetSearch);

  if (payload.image) {
    formData.append('image', payload.image);
  }

  if (payload.removeImage) {
    formData.append('removeImage', 'true');
  }

  return formData;
};

const pageSegmentFormData = (payload: PageSegmentPayload) => {
  const formData = new FormData();

  formData.append('title', payload.title);
  formData.append('primaryCategoryId', payload.primaryCategoryId);
  formData.append('displaySlot', payload.displaySlot);
  formData.append('icon', payload.icon ?? '');
  formData.append('sortOrder', String(payload.sortOrder));
  formData.append('status', payload.status);
  formData.append(
    'topCarousel',
    JSON.stringify(payload.topCarousel.map(({ image: _image, ...slide }) => slide)),
  );
  formData.append(
    'afterNewProductsCarousel',
    JSON.stringify(payload.afterNewProductsCarousel.map(({ image: _image, ...slide }) => slide)),
  );
  formData.append(
    'haveYouSeenCards',
    JSON.stringify(payload.haveYouSeenCards.map(({ image: _image, ...slide }) => slide)),
  );

  if (payload.image) {
    formData.append('image', payload.image);
  }

  if (payload.removeImage) {
    formData.append('removeImage', 'true');
  }

  payload.topCarousel.forEach((slide, index) => {
    if (slide.image) formData.append(`topCarousel.${index}.image`, slide.image);
  });
  payload.afterNewProductsCarousel.forEach((slide, index) => {
    if (slide.image) formData.append(`afterNewProductsCarousel.${index}.image`, slide.image);
  });
  payload.haveYouSeenCards.forEach((slide, index) => {
    if (slide.image) formData.append(`haveYouSeenCards.${index}.image`, slide.image);
  });

  return formData;
};

export const merchandisingApi = {
  async assignProductToSection(payload: ProductSectionAssignmentPayload) {
    const response = await apiClient.post<
      ApiResponse<BackendEntity<StorefrontProductSectionAssignment>>
    >(endpoints.admin.productSectionAssignments, payload);
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async createCarouselSlide(payload: CarouselPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<StorefrontCarouselSlide>>>(
      endpoints.admin.carousel,
      carouselFormData(payload),
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async createPageSegment(payload: PageSegmentPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<StorefrontPageSegment>>>(
      endpoints.admin.pageSegments,
      pageSegmentFormData(payload),
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async createStorefrontIcon(payload: Omit<StorefrontHighlightItem, 'id'>) {
    const response = await apiClient.post<ApiResponse<BackendEntity<StorefrontHighlightItem>>>(
      endpoints.admin.storefrontIcons,
      payload,
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async deleteCarouselSlide(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.carouselSlide(id)))
      .data;
  },
  async deletePageSegment(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.pageSegment(id)))
      .data;
  },
  async deleteProductSectionAssignment(id: string) {
    return (
      await apiClient.delete<ApiResponse<{ id: string }>>(
        endpoints.admin.productSectionAssignment(id),
      )
    ).data;
  },
  async deleteStorefrontIcon(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.storefrontIcon(id)))
      .data;
  },
  async getAdminProfile(options: ListOptions = {}) {
    return (
      await apiClient.get<ApiResponse<AdminProfile>>(endpoints.admin.profile, {
        signal: options.signal,
      })
    ).data.data;
  },
  async getHeaderSettings(options: ListOptions = {}) {
    return (
      await apiClient.get<ApiResponse<HeaderSettings>>(endpoints.storefront.headerSettings, {
        signal: options.signal,
      })
    ).data.data;
  },
  async listAdminCarousel(
    query: { placement?: StorefrontCarouselPlacement | 'all' } = {},
    options: ListOptions = {},
  ) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<StorefrontCarouselSlide>>>
    >(endpoints.admin.carousel, { params: params(query), signal: options.signal });
    return response.data.data.map(normalizeEntity);
  },
  async listAdminProductSections(options: ListOptions = {}) {
    const response = (
      await apiClient.get<ApiResponse<AdminProductSectionResponse>>(
        endpoints.admin.productSections,
        {
          signal: options.signal,
        },
      )
    ).data.data;

    return normalizeProductSections(response);
  },
  async listAdminPageSegments(
    query: {
      displaySlot?: StorefrontPageSegment['displaySlot'] | 'all';
      primaryCategoryId?: string;
      status?: StorefrontPageSegment['status'] | 'all';
    } = {},
    options: ListOptions = {},
  ) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<StorefrontPageSegment>>>>(
      endpoints.admin.pageSegments,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(normalizeEntity);
  },
  async listAdminStorefrontIcons(
    query: { section?: StorefrontHighlightSection | 'all' } = {},
    options: ListOptions = {},
  ) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<StorefrontHighlightItem>>>
    >(endpoints.admin.storefrontIcons, { params: params(query), signal: options.signal });
    return response.data.data.map(normalizeEntity);
  },
  async listStorefrontCarousel(placement: StorefrontCarouselPlacement, options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<StorefrontCarouselSlide>>>
    >(endpoints.storefront.carousel, { params: { placement }, signal: options.signal });
    return response.data.data.map(normalizeEntity);
  },
  async listStorefrontCategories(options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<BackendCategory[]>>(
      endpoints.storefront.categories,
      {
        signal: options.signal,
      },
    );

    return response.data.data.map(mapCategory);
  },
  async listStorefrontIcons(section: StorefrontHighlightSection, options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<StorefrontHighlightItem>>>
    >(endpoints.storefront.icons, { params: { section }, signal: options.signal });
    return response.data.data.map(normalizeEntity);
  },
  async listStorefrontPageSegments(options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<StorefrontPageSegment>>>>(
      endpoints.storefront.pageSegments,
      { signal: options.signal },
    );
    return response.data.data.map(normalizeEntity);
  },
  async getStorefrontPageSegment(id: string, options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<
        Omit<PageSegmentDetailResponse, 'category' | 'segment'> & {
          allProducts: BackendStoreProduct[];
          category: BackendCategory | null;
          newProducts: BackendStoreProduct[];
          segment: BackendEntity<StorefrontPageSegment>;
          topOffers: BackendStoreProduct[];
        }
      >
    >(endpoints.storefront.pageSegment(id), { signal: options.signal });
    const detail = response.data.data;

    return {
      ...detail,
      allProducts: detail.allProducts.map(normalizeStoreProduct),
      category: detail.category ? mapCategory(detail.category) : null,
      newProducts: detail.newProducts.map(normalizeStoreProduct),
      segment: normalizeEntity(detail.segment),
      topOffers: detail.topOffers.map(normalizeStoreProduct),
    };
  },
  async listStorefrontProductSections(options: ListOptions = {}) {
    const response = (
      await apiClient.get<ApiResponse<StorefrontProductSectionResponse>>(
        endpoints.storefront.productSections,
        {
          signal: options.signal,
        },
      )
    ).data.data;

    return normalizeProductSections(response);
  },
  async listStorefrontSecondaryCategories(options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<StorefrontSecondaryCategory>>>
    >(endpoints.storefront.secondaryCategories, { signal: options.signal });
    return response.data.data.map(normalizeSecondaryCategory);
  },
  async updateAdminProfile(payload: AdminProfilePayload) {
    return (await apiClient.put<ApiResponse<AdminProfile>>(endpoints.admin.profile, payload)).data;
  },
  async updateCarouselSlide(id: string, payload: CarouselPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<StorefrontCarouselSlide>>>(
      endpoints.admin.carouselSlide(id),
      carouselFormData(payload),
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async updatePageSegment(id: string, payload: PageSegmentPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<StorefrontPageSegment>>>(
      endpoints.admin.pageSegment(id),
      pageSegmentFormData(payload),
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async updateProductSectionAssignment(id: string, payload: ProductSectionAssignmentPayload) {
    const response = await apiClient.put<
      ApiResponse<BackendEntity<StorefrontProductSectionAssignment>>
    >(endpoints.admin.productSectionAssignment(id), payload);
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
  async updateStorefrontIcon(id: string, payload: Omit<StorefrontHighlightItem, 'id'>) {
    const response = await apiClient.put<ApiResponse<BackendEntity<StorefrontHighlightItem>>>(
      endpoints.admin.storefrontIcon(id),
      payload,
    );
    return { ...response.data, data: normalizeEntity(response.data.data) };
  },
};
