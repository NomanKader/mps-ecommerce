import { isValidObjectId } from 'mongoose';
import * as XLSX from 'xlsx';

import { getTenantModels, TenantModels } from '@core/database/tenant-database';
import { Category } from '@modules/categories/category.types';
import { Role } from '@common/enums/role.enum';
import { Order } from '@modules/orders/order.types';
import { Product } from '@modules/products/product.types';
import { TenantModel } from '@modules/tenants/tenant.model';
import { UserResponse } from '@modules/users/user.types';
import {
  ProductImageMetadata,
  S3Service,
  StorefrontImageMetadata
} from '@shared/services/s3.service';
import { IMAGE_UPLOAD_MAX_BYTES } from '@shared/constants/upload.constants';
import { ApiError } from '@utils/ApiError';
import { HTTP_STATUS } from '@core/response/http-status';
import {
  AdminCustomer,
  DeliveryFee,
  PageSegment,
  PageSegmentSlide,
  Promotion,
  Region,
  SecondaryCategory,
  StorefrontCarouselSlide,
  StorefrontHighlightIcon,
  StorefrontProductSectionAssignment,
  TenantAdminSettings,
  Township
} from './admin.models';

const LOW_STOCK_THRESHOLD = 40;
const MAX_REMOTE_IMAGE_SIZE_BYTES = IMAGE_UPLOAD_MAX_BYTES;

type ListQuery = Record<string, unknown>;
type MongoFilter = Record<string, unknown>;
type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type DashboardQuery = {
  from?: unknown;
  period?: unknown;
  to?: unknown;
};
type ProductPayload = Partial<Product> & { removeImage?: boolean };
type BulkProductPayload = {
  mode?: 'upsert' | 'create-only';
  products?: ProductPayload[];
};
type BulkProductImportItem = {
  productPayload: Partial<Product>;
  row: number;
  subcategoryIcon?: StorefrontHighlightIcon;
  sku: string;
  uploadedImageKey?: string;
};
type AdminProfilePayload = Pick<UserResponse, 'firstName' | 'lastName' | 'email' | 'isActive'> &
  Pick<
    TenantAdminSettings,
    | 'deliveryHeadline'
    | 'logoUrl'
    | 'supportPhoneCountryCode'
    | 'supportPhoneNumber'
    | 'topBarTagline'
  >;
type CarouselPayload = Partial<StorefrontCarouselSlide> & { removeImage?: boolean };

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const monthLabel = (date: Date): string => date.toLocaleDateString('en-US', { month: 'short' });
const dayLabel = (date: Date): string => date.toLocaleDateString('en-US', { weekday: 'short' });
const shortDateLabel = (date: Date): string =>
  date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

const dateFromQuery = (value: unknown): Date | undefined => {
  if (typeof value !== 'string' || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const dashboardPeriodFromQuery = (value: unknown): DashboardPeriod => {
  if (
    value === 'daily' ||
    value === 'weekly' ||
    value === 'monthly' ||
    value === 'yearly' ||
    value === 'custom'
  ) {
    return value;
  }

  return 'weekly';
};
type PageSegmentSlidePayload = Pick<PageSegmentSlide, 'text' | 'sortOrder'> & {
  removeImage?: boolean;
};
type PageSegmentPayload = Partial<
  Pick<
    PageSegment,
    | 'title'
    | 'primaryCategoryId'
    | 'displaySlot'
    | 'icon'
    | 'topCarousel'
    | 'afterNewProductsCarousel'
    | 'haveYouSeenCards'
    | 'sortOrder'
    | 'status'
  >
> & {
  afterNewProductsCarousel?: PageSegmentSlidePayload[];
  haveYouSeenCards?: PageSegmentSlidePayload[];
  removeImage?: boolean;
  topCarousel?: PageSegmentSlidePayload[];
};
type PageSegmentImageKey =
  | 'image'
  | `topCarousel.${number}.image`
  | `afterNewProductsCarousel.${number}.image`
  | `haveYouSeenCards.${number}.image`;
type PageSegmentFileMap = Map<PageSegmentImageKey, Express.Multer.File>;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeHeader = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: unknown }).code === 11000;

const productImageFields = [
  'imageName',
  'imageMimeType',
  'imageSize',
  'imageDriveFileId',
  'removeImage'
] as const;
const carouselImageFields = [
  'imageName',
  'imageMimeType',
  'imageSize',
  'imageDriveFileId',
  'imageUrl',
  'removeImage'
] as const;
const pageSegmentCarouselKeys = [
  'topCarousel',
  'afterNewProductsCarousel',
  'haveYouSeenCards'
] as const;
type PageSegmentCarouselKey = (typeof pageSegmentCarouselKeys)[number];

const productSections = [
  { id: 'top-offers', title: 'Top Offers', description: 'Promoted offers and seasonal savings.' },
  { id: 'top-blooms', title: 'Top Blooms', description: 'Fresh picks and customer favorites.' },
  {
    id: 'new-season',
    title: 'New Season',
    description: 'Recently highlighted products for the current season.'
  },
  {
    id: 'pantry-ready',
    title: 'Pantry Ready',
    description: 'Everyday staples ready for the storefront.'
  }
] as const;

const categoryVisualDefaults = [
  { keywords: ['fruit', 'apple', 'banana', 'berry', 'citrus'], icon: '🍎', color: '#16A34A' },
  { keywords: ['vegetable', 'produce', 'fresh'], icon: '🥬', color: '#22C55E' },
  {
    keywords: ['meat', 'chicken', 'beef', 'pork', 'seafood', 'fish'],
    icon: '🥩',
    color: '#DC2626'
  },
  { keywords: ['dairy', 'milk', 'cheese', 'yogurt'], icon: '🥛', color: '#2563EB' },
  { keywords: ['bakery', 'bread', 'cake', 'pastry'], icon: '🥐', color: '#D97706' },
  {
    keywords: ['drink', 'beverage', 'juice', 'water', 'coffee', 'tea'],
    icon: '🥤',
    color: '#0891B2'
  },
  { keywords: ['snack', 'chips', 'candy', 'sweet'], icon: '🍪', color: '#C026D3' },
  { keywords: ['pantry', 'rice', 'pasta', 'grain', 'oil', 'sauce'], icon: '📦', color: '#7C3AED' },
  { keywords: ['frozen', 'ice'], icon: '❄️', color: '#0284C7' },
  { keywords: ['health', 'beauty', 'personal'], icon: '💊', color: '#DB2777' },
  { keywords: ['home', 'household', 'cleaning'], icon: '🏠', color: '#475569' },
  { keywords: ['baby', 'kids', 'child'], icon: '🍼', color: '#F59E0B' }
] as const;

const bulkProductColumnAliases: Record<string, keyof ProductPayload | 'imageUrl'> = {
  category: 'categoryName',
  categoryid: 'categoryId',
  categoryname: 'categoryName',
  currency: 'currency',
  description: 'description',
  image: 'imageUrl',
  imagelink: 'imageUrl',
  imageurl: 'imageUrl',
  name: 'name',
  price: 'price',
  productname: 'name',
  rating: 'rating',
  sku: 'sku',
  status: 'status',
  stock: 'stock',
  subcategory: 'subcategory',
  subcategoryname: 'subcategory',
  tags: 'tags'
};

type IconSection = StorefrontHighlightIcon['section'];

export class AdminService {
  constructor(private readonly imageStorageService = new S3Service()) {}

  private models(tenantId: string): TenantModels {
    return getTenantModels(tenantId);
  }

  tenantId(tenantId?: string): string {
    return this.requireTenantId(tenantId);
  }

  async dashboard(tenantId?: string, query: DashboardQuery = {}): Promise<Record<string, unknown>> {
    const scopedTenant = this.tenantId(tenantId);
    const { ProductModel, OrderModel, AdminCustomerModel, PromotionModel } =
      this.models(scopedTenant);
    const [tenant, products, orders, customers, promotions] = await Promise.all([
      this.findTenant(scopedTenant),
      ProductModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<Product[]>(),
      OrderModel.find({ tenantId: scopedTenant }).sort({ placedAt: -1 }).lean<Order[]>(),
      AdminCustomerModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<
        AdminCustomer[]
      >(),
      PromotionModel.find({
        tenantId: scopedTenant,
        isDeleted: { $ne: true },
        status: 'active'
      }).lean<Promotion[]>()
    ]);

    const revenueStatuses = new Set(['delivered', 'fulfilled']);
    const revenue = orders
      .filter((order) => revenueStatuses.has(order.status))
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const ordersToFulfill = orders.filter((order) =>
      ['pending', 'processing'].includes(order.status)
    ).length;
    const lowStockProducts = products
      .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock);
    const period = dashboardPeriodFromQuery(query.period);
    const now = new Date();
    const fromDate = dateFromQuery(query.from);
    const toDate = dateFromQuery(query.to);
    const today = startOfDay(now);
    const startDate =
      period === 'daily'
        ? today
        : period === 'monthly'
          ? new Date(now.getFullYear(), now.getMonth(), 1)
          : period === 'yearly'
            ? new Date(now.getFullYear(), 0, 1)
            : period === 'custom' && fromDate
              ? startOfDay(fromDate)
              : addDays(today, -6);
    const endDate = period === 'custom' && toDate ? endOfDay(toDate) : endOfDay(now);
    const trendBuckets =
      period === 'daily'
        ? Array.from({ length: 24 }, (_, hour) => ({
            key: `${hour}`,
            label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour < 12 ? ' AM' : ' PM'}`,
            sales: 0
          }))
        : period === 'yearly'
          ? Array.from({ length: 12 }, (_, month) => {
              const date = new Date(now.getFullYear(), month, 1);
              return { key: `${month}`, label: monthLabel(date), sales: 0 };
            })
          : Array.from(
              {
                length: Math.max(
                  Math.floor((startOfDay(endDate).getTime() - startDate.getTime()) / 86400000) + 1,
                  1
                )
              },
              (_, index) => {
                const date = addDays(startDate, index);
                return {
                  key: date.toISOString().slice(0, 10),
                  label: period === 'weekly' ? dayLabel(date) : shortDateLabel(date),
                  sales: 0
                };
              }
            );
    const salesByKey = new Map(trendBuckets.map((bucket) => [bucket.key, bucket]));

    for (const order of orders) {
      if (!revenueStatuses.has(order.status)) continue;
      const placedAt = new Date(order.placedAt || order.createdAt);
      if (placedAt < startDate || placedAt > endDate) continue;
      const key =
        period === 'daily'
          ? `${placedAt.getHours()}`
          : period === 'yearly'
            ? `${placedAt.getMonth()}`
            : startOfDay(placedAt).toISOString().slice(0, 10);
      const bucket = salesByKey.get(key);
      if (bucket) bucket.sales += Number(order.totalAmount || 0);
    }
    const salesTrend = trendBuckets.map(({ label, sales }) => ({ label, sales }));

    return {
      tenant: {
        name: tenant?.name || "AV's Store",
        plan: tenant?.subscriptionPlan || 'demo'
      },
      totals: {
        catalogItems: products.length,
        orders: orders.length,
        customers: customers.length || this.customerStatsFromOrders(orders).length,
        revenue
      },
      salesTrend,
      salesTrendMeta: {
        from: startDate.toISOString(),
        period,
        to: endDate.toISOString()
      },
      weeklySales: salesTrend.map(({ label, sales }) => ({ day: label, sales })),
      workQueue: {
        ordersToFulfill,
        lowStockSkus: lowStockProducts.length,
        activePromotions: promotions.length
      },
      inventoryAlerts: lowStockProducts.slice(0, 10).map((product) => ({
        _id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock
      })),
      recentOrders: orders.slice(0, 5).map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        currency: order.currency,
        placedAt: order.placedAt
      }))
    };
  }

  async listProducts(tenantId?: string, query: ListQuery = {}): Promise<Product[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { ProductModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [
        { name: regex },
        { sku: regex },
        { categoryName: regex },
        { subcategory: regex },
        { description: regex },
        { tags: regex }
      ];
    }
    if (typeof query.status === 'string' && query.status) filter.status = query.status;
    if (typeof query.categoryId === 'string' && query.categoryId)
      filter.categoryId = query.categoryId;
    if (typeof query.categoryName === 'string' && query.categoryName)
      filter.categoryName = query.categoryName;
    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).lean<Product[]>();
    return Promise.all(products.map((product) => this.withProductImageUrl(product)));
  }

  async createProduct(
    tenantId: string | undefined,
    payload: ProductPayload,
    image?: Express.Multer.File
  ): Promise<Product> {
    const scopedTenant = this.tenantId(tenantId);
    const { ProductModel } = this.models(scopedTenant);
    const productPayload = this.productPayload(payload);
    let imageMetadata: ProductImageMetadata | undefined;

    try {
      if (image) {
        imageMetadata = await this.uploadProductImage(
          image,
          scopedTenant,
          String(productPayload.sku || payload.sku || 'product')
        );
      }

      const product = await ProductModel.create({
        ...productPayload,
        ...imageMetadata,
        tenantId: scopedTenant
      });
      return this.withProductImageUrl(product.toObject() as Product);
    } catch (error) {
      if (imageMetadata)
        await this.imageStorageService.deleteProductImage(imageMetadata.imageDriveFileId);
      throw error;
    }
  }

  async bulkImportProducts(
    tenantId: string | undefined,
    payload: BulkProductPayload,
    file?: Express.Multer.File
  ) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel, ProductModel, StorefrontHighlightIconModel } = this.models(scopedTenant);
    const mode = payload.mode ?? 'upsert';
    const products = file ? this.productsFromBulkFile(file) : (payload.products ?? []);

    if (products.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one product row is required');
    }

    const categories = await CategoryModel.find({
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Category[]>();
    const categoryById = new Map(categories.map((category) => [String(category._id), category]));
    const categoryByName = new Map(
      categories.map((category) => [category.name.toLowerCase(), category])
    );
    const categoryBySlug = new Map(
      categories.map((category) => [category.slug.toLowerCase(), category])
    );
    const storefrontIcons = await StorefrontHighlightIconModel.find({
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<StorefrontHighlightIcon[]>();
    const storefrontIconByLabel = new Map(
      storefrontIcons.map((icon) => [this.storefrontIconKey(icon.label, icon.section), icon])
    );
    let nextIconSortOrder =
      storefrontIcons.reduce((max, icon) => Math.max(max, Number(icon.sortOrder || 0)), 0) + 1;
    const ensureStorefrontIcon = async (
      label: string | undefined,
      section: IconSection
    ): Promise<StorefrontHighlightIcon | undefined> => {
      const normalizedLabel = label?.trim();
      if (!normalizedLabel) return undefined;

      const key = this.storefrontIconKey(normalizedLabel, section);
      const existingIcon = storefrontIconByLabel.get(key);
      if (existingIcon) return existingIcon;

      const visualDefaults = this.categoryVisualDefaults(normalizedLabel);
      let createdIcon: StorefrontHighlightIcon | null;

      try {
        createdIcon = await StorefrontHighlightIconModel.findOneAndUpdate(
          { tenantId: scopedTenant, section, label: normalizedLabel },
          {
            $set: {
              color: visualDefaults.color,
              icon: visualDefaults.icon,
              isDeleted: false,
              label: normalizedLabel,
              section,
              status: 'active'
            },
            $setOnInsert: {
              sortOrder: nextIconSortOrder++,
              tenantId: scopedTenant
            }
          },
          { new: true, setDefaultsOnInsert: true, upsert: true }
        ).lean<StorefrontHighlightIcon>();
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;

        createdIcon = await StorefrontHighlightIconModel.findOne({
          tenantId: scopedTenant,
          section,
          label: normalizedLabel,
          isDeleted: { $ne: true }
        }).lean<StorefrontHighlightIcon>();
      }

      if (createdIcon) storefrontIconByLabel.set(key, createdIcon);
      return createdIcon ?? undefined;
    };
    const resolveCategory = async (
      product: ProductPayload,
      categoryIcon?: StorefrontHighlightIcon
    ): Promise<Category | undefined> => {
      const categoryId = product.categoryId ? String(product.categoryId) : '';
      const categoryName = product.categoryName?.trim();
      const existingCategory =
        (categoryId ? categoryById.get(categoryId) : undefined) ??
        (categoryName ? categoryByName.get(categoryName.toLowerCase()) : undefined) ??
        (categoryName ? categoryBySlug.get(slugify(categoryName)) : undefined);

      if (existingCategory) {
        if (!existingCategory.icon || !existingCategory.color) {
          const visualDefaults = categoryIcon ?? this.categoryVisualDefaults(existingCategory.name);
          await CategoryModel.updateOne(
            { _id: existingCategory._id, tenantId: scopedTenant },
            {
              $set: {
                icon: existingCategory.icon ?? visualDefaults.icon,
                color: existingCategory.color ?? visualDefaults.color
              }
            }
          );
          existingCategory.icon = existingCategory.icon ?? visualDefaults.icon;
          existingCategory.color = existingCategory.color ?? visualDefaults.color;
        }

        return existingCategory;
      }

      if (!categoryName) {
        return existingCategory;
      }

      const slug = slugify(categoryName);
      const visualDefaults = categoryIcon ?? this.categoryVisualDefaults(categoryName);
      let createdCategory: Category | null;

      try {
        createdCategory = await CategoryModel.findOneAndUpdate(
          { tenantId: scopedTenant, slug },
          {
            $set: {
              color: visualDefaults.color,
              icon: visualDefaults.icon,
              isDeleted: false,
              name: categoryName,
              slug
            },
            $setOnInsert: {
              itemCount: 0,
              subcategories: [],
              tenantId: scopedTenant
            }
          },
          { new: true, setDefaultsOnInsert: true, upsert: true }
        ).lean<Category>();
      } catch (error) {
        if (!isDuplicateKeyError(error)) {
          throw error;
        }

        createdCategory = await CategoryModel.findOne({
          tenantId: scopedTenant,
          slug,
          isDeleted: { $ne: true }
        }).lean<Category>();
      }

      if (!createdCategory) {
        return undefined;
      }

      categoryById.set(String(createdCategory._id), createdCategory);
      categoryByName.set(createdCategory.name.toLowerCase(), createdCategory);
      categoryBySlug.set(createdCategory.slug.toLowerCase(), createdCategory);

      return createdCategory;
    };
    const ensureSubcategory = async (category: Category | undefined, subcategory?: string) => {
      const name = subcategory?.trim();

      if (!category || !name) {
        return;
      }

      const existingSubcategory = category.subcategories.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      );

      if (existingSubcategory) {
        return;
      }

      const nextSubcategories = this.uniqueSubcategories([...category.subcategories, name]);
      await CategoryModel.updateOne(
        { _id: category._id, tenantId: scopedTenant },
        { subcategories: nextSubcategories }
      );

      category.subcategories = nextSubcategories;
      categoryById.set(String(category._id), category);
      categoryByName.set(category.name.toLowerCase(), category);
      categoryBySlug.set(category.slug.toLowerCase(), category);
    };
    const seenSkus = new Set<string>();
    const skipped: Array<{ row: number; sku?: string; reason: string }> = [];
    const importable: BulkProductImportItem[] = [];

    for (const [index, product] of products.entries()) {
      const row = file ? index + 2 : index + 1;
      const sku = String(product.sku ?? '').trim();
      const skuKey = sku.toLowerCase();

      if (!sku) {
        skipped.push({ row, reason: 'SKU is required' });
        continue;
      }

      if (seenSkus.has(skuKey)) {
        skipped.push({ row, sku, reason: 'Duplicate SKU in import file' });
        continue;
      }

      seenSkus.add(skuKey);
      const categoryIcon = await ensureStorefrontIcon(product.categoryName, 'featured');
      const subcategoryIcon = await ensureStorefrontIcon(product.subcategory, 'merchandising');
      const category = await resolveCategory(product, categoryIcon);
      await ensureSubcategory(category, product.subcategory);
      let imageMetadata: ProductImageMetadata | undefined;
      const productImageUrl = typeof product.imageUrl === 'string' ? product.imageUrl.trim() : '';

      if (productImageUrl) {
        try {
          imageMetadata = await this.uploadProductImageFromUrl(productImageUrl, scopedTenant, sku);
        } catch (error) {
          skipped.push({
            row,
            sku,
            reason: error instanceof ApiError ? error.message : 'Unable to upload product image'
          });
          continue;
        }
      }

      const productPayload = this.productPayload({
        ...product,
        categoryId: category ? String(category._id) : product.categoryId,
        categoryName: category?.name ?? product.categoryName,
        currency: product.currency || 'MMK',
        description: product.description || '',
        sku,
        status: product.status || 'active',
        tags: product.tags ?? []
      });
      delete productPayload.imageUrl;

      importable.push({
        row,
        subcategoryIcon,
        sku,
        productPayload: {
          ...productPayload,
          ...imageMetadata
        },
        uploadedImageKey: imageMetadata?.imageDriveFileId
      });
    }
    const existingProducts = await ProductModel.find({
      tenantId: scopedTenant,
      sku: { $in: importable.map((item) => item.sku) }
    })
      .select('sku imageDriveFileId')
      .lean<Pick<Product, 'sku' | 'imageDriveFileId'>[]>();
    const existingSkus = new Set(existingProducts.map((product) => product.sku.toLowerCase()));
    const existingImageKeyBySku = new Map(
      existingProducts.map((product) => [product.sku.toLowerCase(), product.imageDriveFileId])
    );
    const operations = importable.flatMap(({ row, sku, productPayload }) => {
      const exists = existingSkus.has(sku.toLowerCase());

      if (mode === 'create-only' && exists) {
        skipped.push({ row, sku, reason: 'SKU already exists' });
        return [];
      }

      return [
        {
          updateOne: {
            filter: { tenantId: scopedTenant, sku },
            update: {
              $set: { ...productPayload, isDeleted: false },
              $setOnInsert: { tenantId: scopedTenant }
            },
            upsert: true
          }
        }
      ];
    });

    const skippedUploadedImageKeys = importable
      .filter(({ sku, uploadedImageKey }) =>
        Boolean(mode === 'create-only' && existingSkus.has(sku.toLowerCase()) && uploadedImageKey)
      )
      .map((item) => item.uploadedImageKey)
      .filter((imageKey): imageKey is string => Boolean(imageKey));

    await Promise.all(
      skippedUploadedImageKeys.map((imageKey) =>
        this.imageStorageService.deleteProductImage(imageKey)
      )
    );

    try {
      if (operations.length > 0) {
        await ProductModel.bulkWrite(operations, { ordered: false });
      }
    } catch (error) {
      await Promise.all(
        importable
          .map((item) => item.uploadedImageKey)
          .filter((imageKey): imageKey is string => Boolean(imageKey))
          .map((imageKey) => this.imageStorageService.deleteProductImage(imageKey))
      );
      throw error;
    }

    const processedSkus = importable
      .filter(({ sku }) => !(mode === 'create-only' && existingSkus.has(sku.toLowerCase())))
      .map(({ sku }) => sku);
    await Promise.all(
      importable
        .filter(({ sku, uploadedImageKey }) => {
          const existingImageKey = existingImageKeyBySku.get(sku.toLowerCase());
          return Boolean(
            uploadedImageKey && existingImageKey && existingImageKey !== uploadedImageKey
          );
        })
        .map(({ sku }) =>
          this.imageStorageService.deleteProductImage(existingImageKeyBySku.get(sku.toLowerCase()))
        )
    );
    await this.ensureSecondaryCategoriesFromImport(scopedTenant, importable, processedSkus);

    return {
      created: processedSkus.filter((sku) => !existingSkus.has(sku.toLowerCase())).length,
      skipped,
      total: products.length,
      updated: processedSkus.filter((sku) => existingSkus.has(sku.toLowerCase())).length
    };
  }

  async updateProduct(
    tenantId: string | undefined,
    id: string,
    payload: ProductPayload,
    image?: Express.Multer.File
  ): Promise<Product> {
    const scopedTenant = this.tenantId(tenantId);
    const { ProductModel } = this.models(scopedTenant);
    const filter = { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } };
    const productPayload = this.productPayload(payload);
    let imageMetadata: ProductImageMetadata | undefined;

    if (image || payload.removeImage) {
      const existingProduct = await ProductModel.findOne(filter).lean<Product>();
      if (!existingProduct) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

      if (image) {
        imageMetadata = await this.uploadProductImage(
          image,
          scopedTenant,
          String(productPayload.sku || existingProduct.sku)
        );
      }

      const update = imageMetadata
        ? { ...productPayload, ...imageMetadata }
        : {
            $set: productPayload,
            $unset: {
              imageName: '',
              imageMimeType: '',
              imageSize: '',
              imageDriveFileId: '',
              imageUrl: ''
            }
          };

      try {
        const product = await ProductModel.findOneAndUpdate(filter, update, {
          new: true
        }).lean<Product>();
        if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

        if (image || payload.removeImage)
          await this.imageStorageService.deleteProductImage(existingProduct.imageDriveFileId);
        return this.withProductImageUrl(product);
      } catch (error) {
        if (imageMetadata)
          await this.imageStorageService.deleteProductImage(imageMetadata.imageDriveFileId);
        throw error;
      }
    }

    const product = await ProductModel.findOneAndUpdate(filter, productPayload, {
      new: true
    }).lean<Product>();
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    return this.withProductImageUrl(product);
  }

  async deleteProduct(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.tenantId(tenantId);
    const { ProductModel } = this.models(scopedTenant);
    const result = await ProductModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    return { id };
  }

  async getAdminProfile(tenantId: string | undefined, userId: string | undefined) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { UserModel } = this.models(scopedTenant);
    if (!userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');

    const [admin, headerSettings] = await Promise.all([
      UserModel.findOne({
        _id: userId,
        tenantId: scopedTenant,
        role: Role.TENANT_ADMIN,
        isDeleted: { $ne: true }
      })
        .select('-password')
        .lean<UserResponse>(),
      this.getTenantAdminSettings(scopedTenant)
    ]);

    if (!admin) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Admin user not found');

    return {
      admin: this.adminProfileResponse(admin),
      headerSettings: this.headerSettingsResponse(headerSettings)
    };
  }

  async updateAdminProfile(
    tenantId: string | undefined,
    userId: string | undefined,
    payload: AdminProfilePayload
  ) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { UserModel, TenantAdminSettingsModel } = this.models(scopedTenant);
    if (!userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');

    const admin = await UserModel.findOneAndUpdate(
      { _id: userId, tenantId: scopedTenant, role: Role.TENANT_ADMIN, isDeleted: { $ne: true } },
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        isActive: payload.isActive
      },
      { new: true }
    )
      .select('-password')
      .lean<UserResponse>();

    if (!admin) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Admin user not found');

    const headerSettings = await TenantAdminSettingsModel.findOneAndUpdate(
      { tenantId: scopedTenant, isDeleted: { $ne: true } },
      {
        deliveryHeadline: payload.deliveryHeadline,
        logoUrl: payload.logoUrl || undefined,
        supportPhoneCountryCode: payload.supportPhoneCountryCode,
        supportPhoneNumber: payload.supportPhoneNumber,
        topBarTagline: payload.topBarTagline
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<TenantAdminSettings>();

    return {
      admin: this.adminProfileResponse(admin),
      headerSettings: this.headerSettingsResponse(headerSettings)
    };
  }

  async listCarousel(
    tenantId: string | undefined,
    query: ListQuery = {}
  ): Promise<StorefrontCarouselSlide[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontCarouselSlideModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.placement === 'string' && query.placement && query.placement !== 'all')
      filter.placement = query.placement;
    const slides = await StorefrontCarouselSlideModel.find(filter)
      .sort({ placement: 1, sortOrder: 1, createdAt: -1 })
      .lean<StorefrontCarouselSlide[]>();
    return Promise.all(slides.map((slide) => this.withCarouselImageUrl(slide)));
  }

  async createCarouselSlide(
    tenantId: string | undefined,
    payload: CarouselPayload,
    image?: Express.Multer.File
  ): Promise<StorefrontCarouselSlide> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontCarouselSlideModel } = this.models(scopedTenant);
    const slidePayload = this.carouselPayload(payload);
    let imageMetadata: StorefrontImageMetadata | undefined;

    try {
      if (image)
        imageMetadata = await this.uploadStorefrontImage(
          image,
          scopedTenant,
          String(slidePayload.placement || 'carousel')
        );
      const slide = await StorefrontCarouselSlideModel.create({
        ...slidePayload,
        ...imageMetadata,
        tenantId: scopedTenant
      });
      return this.withCarouselImageUrl(slide.toObject() as StorefrontCarouselSlide);
    } catch (error) {
      if (imageMetadata)
        await this.imageStorageService.deleteProductImage(imageMetadata.imageDriveFileId);
      throw error;
    }
  }

  async updateCarouselSlide(
    tenantId: string | undefined,
    id: string,
    payload: CarouselPayload,
    image?: Express.Multer.File
  ): Promise<StorefrontCarouselSlide> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontCarouselSlideModel } = this.models(scopedTenant);
    const filter = { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } };
    const slidePayload = this.carouselPayload(payload);
    let imageMetadata: StorefrontImageMetadata | undefined;

    if (image || payload.removeImage) {
      const existingSlide =
        await StorefrontCarouselSlideModel.findOne(filter).lean<StorefrontCarouselSlide>();
      if (!existingSlide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
      if (image)
        imageMetadata = await this.uploadStorefrontImage(
          image,
          scopedTenant,
          String(slidePayload.placement || existingSlide.placement)
        );

      const update = imageMetadata
        ? { ...slidePayload, ...imageMetadata }
        : {
            $set: slidePayload,
            $unset: { imageName: '', imageMimeType: '', imageSize: '', imageDriveFileId: '' }
          };

      try {
        const slide = await StorefrontCarouselSlideModel.findOneAndUpdate(filter, update, {
          new: true
        }).lean<StorefrontCarouselSlide>();
        if (!slide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
        await this.imageStorageService.deleteProductImage(existingSlide.imageDriveFileId);
        return this.withCarouselImageUrl(slide);
      } catch (error) {
        if (imageMetadata)
          await this.imageStorageService.deleteProductImage(imageMetadata.imageDriveFileId);
        throw error;
      }
    }

    const slide = await StorefrontCarouselSlideModel.findOneAndUpdate(filter, slidePayload, {
      new: true
    }).lean<StorefrontCarouselSlide>();
    if (!slide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
    return this.withCarouselImageUrl(slide);
  }

  async deleteCarouselSlide(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontCarouselSlideModel } = this.models(scopedTenant);
    const result = await StorefrontCarouselSlideModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
    return { id };
  }

  async listStorefrontIcons(
    tenantId: string | undefined,
    query: ListQuery = {}
  ): Promise<StorefrontHighlightIcon[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontHighlightIconModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.section === 'string' && query.section && query.section !== 'all')
      filter.section = query.section;
    return StorefrontHighlightIconModel.find(filter)
      .sort({ section: 1, sortOrder: 1, createdAt: 1 })
      .lean<StorefrontHighlightIcon[]>();
  }

  async createStorefrontIcon(
    tenantId: string | undefined,
    payload: Partial<StorefrontHighlightIcon>
  ): Promise<StorefrontHighlightIcon> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontHighlightIconModel } = this.models(scopedTenant);
    return StorefrontHighlightIconModel.create({ ...payload, tenantId: scopedTenant }).then(
      (document) => document.toObject() as StorefrontHighlightIcon
    );
  }

  async updateStorefrontIcon(
    tenantId: string | undefined,
    id: string,
    payload: Partial<StorefrontHighlightIcon>
  ): Promise<StorefrontHighlightIcon> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontHighlightIconModel } = this.models(scopedTenant);
    const icon = await StorefrontHighlightIconModel.findOneAndUpdate(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    ).lean<StorefrontHighlightIcon>();
    if (!icon) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Storefront icon not found');
    return icon;
  }

  async deleteStorefrontIcon(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontHighlightIconModel } = this.models(scopedTenant);
    const result = await StorefrontHighlightIconModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Storefront icon not found');
    return { id };
  }

  async listSecondaryCategories(
    tenantId: string | undefined,
    query: ListQuery = {}
  ): Promise<SecondaryCategory[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { SecondaryCategoryModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };

    if (typeof query.status === 'string' && query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { slug: regex }, { icon: regex }];
    }

    const secondaryCategories = await SecondaryCategoryModel.find(filter)
      .sort({ name: 1 })
      .lean<SecondaryCategory[]>();

    return secondaryCategories.map((category) => this.secondaryCategoryResponse(category));
  }

  async createSecondaryCategory(
    tenantId: string | undefined,
    payload: Partial<SecondaryCategory>
  ): Promise<SecondaryCategory> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { SecondaryCategoryModel } = this.models(scopedTenant);
    const name = String(payload.name ?? '').trim();
    const productIds = this.normalizeSecondaryCategoryProductIds(payload);
    await this.requireTenantProducts(scopedTenant, productIds);

    try {
      return SecondaryCategoryModel.create({
        ...payload,
        name,
        productId: productIds[0],
        productIds,
        slug: typeof payload.slug === 'string' ? slugify(payload.slug) : slugify(name),
        tenantId: scopedTenant
      }).then((document) =>
        this.secondaryCategoryResponse(document.toObject() as SecondaryCategory)
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Secondary category slug already exists');
      }

      throw error;
    }
  }

  async updateSecondaryCategory(
    tenantId: string | undefined,
    id: string,
    payload: Partial<SecondaryCategory>
  ): Promise<SecondaryCategory> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { SecondaryCategoryModel } = this.models(scopedTenant);
    const productIds =
      payload.productIds || payload.productId
        ? this.normalizeSecondaryCategoryProductIds(payload)
        : undefined;
    if (productIds) await this.requireTenantProducts(scopedTenant, productIds);
    const updatePayload = {
      ...payload,
      ...(productIds ? { productId: productIds[0], productIds } : {}),
      ...(typeof payload.name === 'string' ? { name: payload.name.trim() } : {}),
      ...(typeof payload.slug === 'string'
        ? { slug: slugify(payload.slug) }
        : typeof payload.name === 'string'
          ? { slug: slugify(payload.name) }
          : {})
    };

    try {
      const secondaryCategory = await SecondaryCategoryModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        updatePayload,
        { new: true }
      ).lean<SecondaryCategory>();
      if (!secondaryCategory) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Secondary category not found');
      }

      return this.secondaryCategoryResponse(secondaryCategory);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Secondary category slug already exists');
      }

      throw error;
    }
  }

  async deleteSecondaryCategory(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { SecondaryCategoryModel } = this.models(scopedTenant);
    const result = await SecondaryCategoryModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Secondary category not found');
    }

    return { id };
  }

  async listProductSections(tenantId: string | undefined) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontProductSectionAssignmentModel, ProductModel } = this.models(scopedTenant);
    const assignments = await StorefrontProductSectionAssignmentModel.find({
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    })
      .sort({ sectionId: 1, sortOrder: 1 })
      .lean<StorefrontProductSectionAssignment[]>();
    const productIds = [...new Set(assignments.map((assignment) => assignment.productId))];
    const products = await ProductModel.find({
      _id: { $in: productIds },
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Product[]>();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    return {
      sections: await Promise.all(
        productSections.map(async (section) => {
          const productsForSection = await Promise.all(
            assignments
              .filter((assignment) => assignment.sectionId === section.id)
              .map(async (assignment) => ({
                ...(productsById.has(assignment.productId)
                  ? await this.withProductImageUrl(
                      productsById.get(assignment.productId) as Product
                    )
                  : {}),
                assignmentId: assignment._id,
                sectionAssignmentId: assignment._id,
                sortOrder: assignment.sortOrder,
                status: assignment.status
              }))
          );

          return {
            ...section,
            products: productsForSection.filter((product) => product._id)
          };
        })
      )
    };
  }

  async createProductSectionAssignment(
    tenantId: string | undefined,
    payload: Partial<StorefrontProductSectionAssignment>
  ): Promise<StorefrontProductSectionAssignment> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontProductSectionAssignmentModel } = this.models(scopedTenant);
    await this.requireTenantProduct(scopedTenant, String(payload.productId));

    try {
      return await StorefrontProductSectionAssignmentModel.create({
        ...payload,
        tenantId: scopedTenant
      }).then((document) => document.toObject() as StorefrontProductSectionAssignment);
    } catch (error) {
      if (isDuplicateKeyError(error))
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Product is already active in this section');
      throw error;
    }
  }

  async updateProductSectionAssignment(
    tenantId: string | undefined,
    id: string,
    payload: Partial<StorefrontProductSectionAssignment>
  ): Promise<StorefrontProductSectionAssignment> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontProductSectionAssignmentModel } = this.models(scopedTenant);
    if (payload.productId) await this.requireTenantProduct(scopedTenant, String(payload.productId));

    try {
      const assignment = await StorefrontProductSectionAssignmentModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        payload,
        { new: true }
      ).lean<StorefrontProductSectionAssignment>();
      if (!assignment)
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product section assignment not found');
      return assignment;
    } catch (error) {
      if (isDuplicateKeyError(error))
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Product is already active in this section');
      throw error;
    }
  }

  async deleteProductSectionAssignment(
    tenantId: string | undefined,
    id: string
  ): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontProductSectionAssignmentModel } = this.models(scopedTenant);
    const result = await StorefrontProductSectionAssignmentModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product section assignment not found');
    return { id };
  }

  async listPageSegments(
    tenantId: string | undefined,
    query: ListQuery = {}
  ): Promise<PageSegment[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { PageSegmentModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };

    if (typeof query.displaySlot === 'string' && query.displaySlot && query.displaySlot !== 'all') {
      filter.displaySlot = query.displaySlot;
    }

    if (typeof query.status === 'string' && query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (typeof query.primaryCategoryId === 'string' && query.primaryCategoryId) {
      filter.primaryCategoryId = query.primaryCategoryId;
    }

    const segments = await PageSegmentModel.find(filter)
      .sort({ displaySlot: 1, sortOrder: 1, createdAt: -1 })
      .lean<PageSegment[]>();

    return Promise.all(segments.map((segment) => this.withPageSegmentImageUrls(segment)));
  }

  async createPageSegment(
    tenantId: string | undefined,
    payload: PageSegmentPayload,
    files?: unknown
  ): Promise<PageSegment> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { PageSegmentModel } = this.models(scopedTenant);
    await this.requireTenantCategory(scopedTenant, String(payload.primaryCategoryId));
    const fileMap = this.pageSegmentFileMap(files);
    const uploadedKeys: string[] = [];

    try {
      const imageMetadata = await this.uploadOptionalPageSegmentImage(
        fileMap.get('image'),
        scopedTenant,
        'segment'
      );
      if (imageMetadata?.imageDriveFileId) uploadedKeys.push(imageMetadata.imageDriveFileId);

      const segmentPayload = await this.pageSegmentPayload(payload, fileMap, scopedTenant, uploadedKeys);
      const segment = await PageSegmentModel.create({
        ...segmentPayload,
        ...imageMetadata,
        tenantId: scopedTenant
      });

      return this.withPageSegmentImageUrls(segment.toObject() as PageSegment);
    } catch (error) {
      await Promise.all(uploadedKeys.map((key) => this.imageStorageService.deleteProductImage(key)));
      throw error;
    }
  }

  async updatePageSegment(
    tenantId: string | undefined,
    id: string,
    payload: PageSegmentPayload,
    files?: unknown
  ): Promise<PageSegment> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { PageSegmentModel } = this.models(scopedTenant);
    if (payload.primaryCategoryId)
      await this.requireTenantCategory(scopedTenant, String(payload.primaryCategoryId));

    const existingSegment = await PageSegmentModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<PageSegment>();
    if (!existingSegment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Page segment not found');

    const fileMap = this.pageSegmentFileMap(files);
    const uploadedKeys: string[] = [];
    const replacedKeys: string[] = [];

    try {
      const imageMetadata = await this.uploadOptionalPageSegmentImage(
        fileMap.get('image'),
        scopedTenant,
        'segment'
      );
      if (imageMetadata?.imageDriveFileId) {
        uploadedKeys.push(imageMetadata.imageDriveFileId);
        if (existingSegment.imageDriveFileId) replacedKeys.push(existingSegment.imageDriveFileId);
      } else if (payload.removeImage && existingSegment.imageDriveFileId) {
        replacedKeys.push(existingSegment.imageDriveFileId);
      }

      const segmentPayload = await this.pageSegmentPayload(
        payload,
        fileMap,
        scopedTenant,
        uploadedKeys,
        existingSegment,
        replacedKeys
      );
      const update = imageMetadata
        ? { ...segmentPayload, ...imageMetadata }
        : payload.removeImage
          ? {
              $set: segmentPayload,
              $unset: { imageName: '', imageMimeType: '', imageSize: '', imageDriveFileId: '' }
            }
          : { $set: segmentPayload };

      const segment = await PageSegmentModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        update,
        { new: true }
      ).lean<PageSegment>();
      if (!segment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Page segment not found');

      await Promise.all(replacedKeys.map((key) => this.imageStorageService.deleteProductImage(key)));
      return this.withPageSegmentImageUrls(segment);
    } catch (error) {
      await Promise.all(uploadedKeys.map((key) => this.imageStorageService.deleteProductImage(key)));
      throw error;
    }
  }

  async deletePageSegment(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { PageSegmentModel } = this.models(scopedTenant);
    const result = await PageSegmentModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Page segment not found');
    return { id };
  }

  async storefrontHeaderSettings(tenantId?: string) {
    const scopedTenant = this.requireTenantId(tenantId);
    return this.headerSettingsResponse(await this.getTenantAdminSettings(scopedTenant));
  }

  async storefrontCarousel(
    tenantId: string | undefined,
    placement: StorefrontCarouselSlide['placement']
  ): Promise<StorefrontCarouselSlide[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontCarouselSlideModel } = this.models(scopedTenant);
    const now = new Date();
    const slides = await StorefrontCarouselSlideModel.find({
      tenantId: scopedTenant,
      placement,
      status: 'active',
      isDeleted: { $ne: true },
      $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }]
    })
      .sort({ sortOrder: 1 })
      .lean<StorefrontCarouselSlide[]>();

    return Promise.all(slides.map((slide) => this.withCarouselImageUrl(slide)));
  }

  async storefrontIcons(
    tenantId: string | undefined,
    section: 'featured' | 'merchandising'
  ): Promise<StorefrontHighlightIcon[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontHighlightIconModel } = this.models(scopedTenant);
    return StorefrontHighlightIconModel.find({
      tenantId: scopedTenant,
      section,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .select('label icon color surfaceColor textColor section sortOrder')
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean<StorefrontHighlightIcon[]>();
  }

  async storefrontProductSections(tenantId?: string) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { StorefrontProductSectionAssignmentModel, ProductModel } = this.models(scopedTenant);
    const assignments = await StorefrontProductSectionAssignmentModel.find({
      tenantId: scopedTenant,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .sort({ sortOrder: 1 })
      .lean<StorefrontProductSectionAssignment[]>();
    const productIds = [...new Set(assignments.map((assignment) => assignment.productId))];
    const products = await ProductModel.find({
      _id: { $in: productIds },
      tenantId: scopedTenant,
      status: 'active',
      isDeleted: { $ne: true }
    }).lean<Product[]>();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    return {
      sections: await Promise.all(
        productSections.map(async (section) => ({
          ...section,
          products: await Promise.all(
            assignments
              .filter(
                (assignment) =>
                  assignment.sectionId === section.id && productsById.has(assignment.productId)
              )
              .map(async (assignment) => ({
                ...(await this.withProductImageUrl(
                  productsById.get(assignment.productId) as Product
                )),
                assignmentId: assignment._id,
                sectionAssignmentId: assignment._id,
                sortOrder: assignment.sortOrder,
                status: assignment.status
              }))
          )
        }))
      )
    };
  }

  async storefrontSecondaryCategories(tenantId?: string): Promise<SecondaryCategory[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { SecondaryCategoryModel } = this.models(scopedTenant);

    const secondaryCategories = await SecondaryCategoryModel.find({
      tenantId: scopedTenant,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .sort({ name: 1, createdAt: 1 })
      .lean<SecondaryCategory[]>();

    return secondaryCategories.map((category) => this.secondaryCategoryResponse(category));
  }

  async storefrontPageSegments(tenantId?: string): Promise<PageSegment[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { PageSegmentModel } = this.models(scopedTenant);
    const segments = await PageSegmentModel.find({
      tenantId: scopedTenant,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .sort({ displaySlot: 1, sortOrder: 1, createdAt: -1 })
      .lean<PageSegment[]>();

    return Promise.all(segments.map((segment) => this.withPageSegmentImageUrls(segment)));
  }

  async storefrontPageSegmentDetail(tenantId: string | undefined, id: string) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel, PageSegmentModel, ProductModel } = this.models(scopedTenant);
    const segment = await PageSegmentModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      status: 'active',
      isDeleted: { $ne: true }
    }).lean<PageSegment>();
    if (!segment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Page segment not found');

    const [category, productsByRating, productsByDate] = await Promise.all([
      CategoryModel.findOne({
        _id: segment.primaryCategoryId,
        tenantId: scopedTenant,
        isDeleted: { $ne: true }
      }).lean(),
      ProductModel.find({
        tenantId: scopedTenant,
        categoryId: segment.primaryCategoryId,
        status: 'active',
        isDeleted: { $ne: true }
      })
        .sort({ rating: -1, createdAt: -1 })
        .lean<Product[]>(),
      ProductModel.find({
        tenantId: scopedTenant,
        categoryId: segment.primaryCategoryId,
        status: 'active',
        isDeleted: { $ne: true }
      })
        .sort({ createdAt: -1 })
        .lean<Product[]>()
    ]);

    const allProductIds = new Set<string>();
    const uniqueProducts = [...productsByRating, ...productsByDate].filter((product) => {
      const productId = String(product._id);
      if (allProductIds.has(productId)) return false;
      allProductIds.add(productId);
      return true;
    });
    const productsWithImages = new Map(
      await Promise.all(
        uniqueProducts.map(async (product) => [
          String(product._id),
          await this.withProductImageUrl(product)
        ] as const)
      )
    );

    return {
      segment: await this.withPageSegmentImageUrls(segment),
      category,
      subcategories: category?.subcategories ?? [],
      topOffers: productsByRating
        .slice(0, 5)
        .map((product) => productsWithImages.get(String(product._id)))
        .filter(Boolean),
      newProducts: productsByDate
        .slice(0, 5)
        .map((product) => productsWithImages.get(String(product._id)))
        .filter(Boolean),
      allProducts: productsByDate
        .map((product) => productsWithImages.get(String(product._id)))
        .filter(Boolean)
    };
  }

  private productPayload(payload: ProductPayload): Partial<Product> {
    const sanitizedPayload = { ...payload };

    for (const field of productImageFields) {
      delete sanitizedPayload[field];
    }

    return sanitizedPayload;
  }

  private async ensureSecondaryCategoriesFromImport(
    tenantId: string,
    importable: BulkProductImportItem[],
    processedSkus: string[]
  ): Promise<void> {
    const processedSkuSet = new Set(processedSkus.map((sku) => sku.toLowerCase()));
    const secondaryCategoryRows = importable.filter((item) => {
      const subcategory = item.productPayload.subcategory?.trim();
      return Boolean(subcategory && processedSkuSet.has(item.sku.toLowerCase()));
    });

    if (secondaryCategoryRows.length === 0) return;

    const { ProductModel, SecondaryCategoryModel } = this.models(tenantId);
    const products = await ProductModel.find({
      tenantId,
      sku: { $in: secondaryCategoryRows.map((item) => item.sku) },
      isDeleted: { $ne: true }
    })
      .select('_id sku')
      .lean<Pick<Product, '_id' | 'sku'>[]>();
    const productBySku = new Map(products.map((product) => [product.sku.toLowerCase(), product]));
    const seenSlugs = new Set<string>();
    const targetSectionId: SecondaryCategory['targetSectionId'] = 'top-offers';
    const status: SecondaryCategory['status'] = 'active';
    const operations = secondaryCategoryRows.flatMap((item) => {
      const name = item.productPayload.subcategory?.trim();
      const product = productBySku.get(item.sku.toLowerCase());
      if (!name || !product) return [];

      const slug = slugify(name);
      if (seenSlugs.has(slug)) return [];
      seenSlugs.add(slug);

      const visualDefaults = item.subcategoryIcon ?? this.categoryVisualDefaults(name);

      return [
        {
          updateOne: {
            filter: { tenantId, slug },
            update: {
              $set: {
                color: visualDefaults.color,
                icon: visualDefaults.icon,
                isDeleted: false,
                name,
                productId: String(product._id),
                status,
                targetSectionId
              },
              $setOnInsert: {
                tenantId
              }
            },
            upsert: true
          }
        }
      ];
    });

    if (operations.length > 0) {
      await SecondaryCategoryModel.bulkWrite(operations, { ordered: false });
    }
  }

  private productsFromBulkFile(file: Express.Multer.File): ProductPayload[] {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Bulk file does not contain a worksheet');
      }

      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Bulk file does not contain a worksheet');
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
        raw: false
      });

      return rows
        .map((row) => this.productFromBulkRow(row))
        .filter((product) =>
          Object.values(product).some((value) => value !== undefined && value !== '')
        );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unable to parse CSV or Excel product file');
    }
  }

  private productFromBulkRow(row: Record<string, unknown>): ProductPayload {
    const product: ProductPayload = {};

    for (const [header, value] of Object.entries(row)) {
      const field = bulkProductColumnAliases[normalizeHeader(header)];
      if (!field) continue;

      const normalizedValue = this.bulkCellValue(value);
      if (normalizedValue === undefined) continue;

      if (field === 'price' || field === 'stock' || field === 'rating') {
        const numberValue = Number(normalizedValue);
        if (!Number.isNaN(numberValue)) product[field] = numberValue;
        continue;
      }

      if (field === 'tags') {
        product.tags = String(normalizedValue)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        continue;
      }

      product[field] = normalizedValue as never;
    }

    return product;
  }

  private bulkCellValue(value: unknown): string | number | undefined {
    if (value === undefined || value === null) return undefined;
    const stringValue = String(value).trim();
    return stringValue === '' ? undefined : stringValue;
  }

  private categoryVisualDefaults(categoryName: string): Pick<Category, 'icon' | 'color'> {
    const normalizedCategoryName = categoryName.toLowerCase();
    const defaults = categoryVisualDefaults.find((item) =>
      item.keywords.some((keyword) => normalizedCategoryName.includes(keyword))
    );

    return {
      icon: defaults?.icon ?? '🏷️',
      color: defaults?.color ?? '#64748B'
    };
  }

  private storefrontIconKey(label: string, section: IconSection): string {
    return `${section}:${label.trim().toLowerCase()}`;
  }

  private async uploadProductImageFromUrl(
    imageUrl: string,
    tenantId: string,
    sku: string
  ): Promise<ProductImageMetadata> {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link is not a valid URL');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link must use HTTP or HTTPS');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(parsedUrl, { signal: controller.signal });

      if (!response.ok) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link could not be downloaded');
      }

      const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || '';
      if (!contentType.startsWith('image/')) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link must point to an image');
      }

      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > MAX_REMOTE_IMAGE_SIZE_BYTES) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link is larger than 5MB');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > MAX_REMOTE_IMAGE_SIZE_BYTES) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link is larger than 5MB');
      }

      return this.uploadProductImage(
        {
          buffer,
          fieldname: 'image',
          originalname: this.remoteImageFilename(parsedUrl, contentType),
          encoding: '7bit',
          mimetype: contentType,
          size: buffer.length,
          stream: undefined as never,
          destination: '',
          filename: '',
          path: ''
        },
        tenantId,
        sku
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product image link could not be downloaded');
    } finally {
      clearTimeout(timeout);
    }
  }

  private remoteImageFilename(url: URL, contentType: string): string {
    const pathnameName = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? '');
    if (pathnameName.includes('.')) return pathnameName;

    const extensionByContentType: Record<string, string> = {
      'image/gif': 'gif',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/svg+xml': 'svg',
      'image/webp': 'webp'
    };
    const extension = extensionByContentType[contentType] ?? 'img';

    return `product-image.${extension}`;
  }

  private carouselPayload(payload: CarouselPayload): Partial<StorefrontCarouselSlide> {
    const sanitizedPayload = { ...payload };

    for (const field of carouselImageFields) {
      delete sanitizedPayload[field];
    }
    delete sanitizedPayload.removeImage;

    return sanitizedPayload;
  }

  private async uploadProductImage(
    image: Express.Multer.File,
    tenantId: string,
    sku: string
  ): Promise<ProductImageMetadata> {
    try {
      return await this.imageStorageService.uploadProductImage(image, tenantId, sku);
    } catch {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Unable to upload product image. Please try again.'
      );
    }
  }

  private async uploadStorefrontImage(
    image: Express.Multer.File,
    tenantId: string,
    reference: string
  ): Promise<StorefrontImageMetadata> {
    try {
      return await this.imageStorageService.uploadStorefrontImage(image, tenantId, reference);
    } catch {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Unable to upload storefront image. Please try again.'
      );
    }
  }

  private async withProductImageUrl(product: Product): Promise<Product> {
    const imageUrl = await this.imageStorageService.getProductImageUrl(
      product.imageDriveFileId,
      product.imageName
    );
    return { ...product, imageUrl: imageUrl ?? product.imageUrl ?? null };
  }

  private async withCarouselImageUrl(
    slide: StorefrontCarouselSlide
  ): Promise<StorefrontCarouselSlide> {
    const imageUrl = await this.imageStorageService.getProductImageUrl(
      slide.imageDriveFileId,
      slide.imageName
    );
    return { ...slide, imageUrl: imageUrl ?? slide.imageUrl ?? null };
  }

  private async withPageSegmentImageUrls(segment: PageSegment): Promise<PageSegment> {
    const imageUrl = await this.imageStorageService.getProductImageUrl(
      segment.imageDriveFileId,
      segment.imageName
    );
    const withSlideUrls = async (slides: PageSegmentSlide[] = []) =>
      Promise.all(
        slides.map(async (slide) => {
          const slideImageUrl = await this.imageStorageService.getProductImageUrl(
            slide.imageDriveFileId,
            slide.imageName
          );

          return {
            ...slide,
            imageUrl: slideImageUrl ?? slide.imageUrl ?? null
          };
        })
      );

    return {
      ...segment,
      imageUrl: imageUrl ?? segment.imageUrl ?? null,
      topCarousel: await withSlideUrls(segment.topCarousel),
      afterNewProductsCarousel: await withSlideUrls(segment.afterNewProductsCarousel),
      haveYouSeenCards: await withSlideUrls(segment.haveYouSeenCards)
    };
  }

  private async getTenantAdminSettings(tenantId: string): Promise<TenantAdminSettings> {
    const { TenantAdminSettingsModel } = this.models(tenantId);
    const settings = await TenantAdminSettingsModel.findOneAndUpdate(
      { tenantId, isDeleted: { $ne: true } },
      { $setOnInsert: { tenantId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<TenantAdminSettings>();

    return settings;
  }

  private pageSegmentFileMap(files?: unknown): PageSegmentFileMap {
    const fileList = Array.isArray(files)
      ? files
      : files && typeof files === 'object'
        ? Object.values(files).flat()
        : [];
    const map = new Map<PageSegmentImageKey, Express.Multer.File>();

    for (const file of fileList) {
      if (!file || typeof file !== 'object' || !('fieldname' in file)) continue;
      map.set((file as Express.Multer.File).fieldname as PageSegmentImageKey, file as Express.Multer.File);
    }

    return map;
  }

  private async uploadOptionalPageSegmentImage(
    image: Express.Multer.File | undefined,
    tenantId: string,
    reference: string
  ): Promise<StorefrontImageMetadata | undefined> {
    if (!image) return undefined;
    return this.uploadStorefrontImage(image, tenantId, reference);
  }

  private async pageSegmentPayload(
    payload: PageSegmentPayload,
    files: PageSegmentFileMap,
    tenantId: string,
    uploadedKeys: string[],
    existingSegment?: PageSegment,
    replacedKeys: string[] = []
  ): Promise<Partial<PageSegment>> {
    const segmentPayload: Partial<PageSegment> = {
      title: payload.title?.trim(),
      primaryCategoryId: payload.primaryCategoryId,
      displaySlot: payload.displaySlot,
      icon: payload.icon,
      sortOrder: payload.sortOrder,
      status: payload.status
    };

    for (const key of pageSegmentCarouselKeys) {
      segmentPayload[key] = await this.pageSegmentSlidesPayload(
        key,
        payload[key] ?? [],
        files,
        tenantId,
        uploadedKeys,
        existingSegment?.[key] ?? [],
        replacedKeys
      );
    }

    return segmentPayload;
  }

  private async pageSegmentSlidesPayload(
    key: PageSegmentCarouselKey,
    slides: PageSegmentSlidePayload[],
    files: PageSegmentFileMap,
    tenantId: string,
    uploadedKeys: string[],
    existingSlides: PageSegmentSlide[],
    replacedKeys: string[]
  ): Promise<PageSegmentSlide[]> {
    return Promise.all(
      slides.map(async (slide, index) => {
        const existingSlide = existingSlides[index];
        const image = files.get(`${key}.${index}.image` as PageSegmentImageKey);
        const metadata = await this.uploadOptionalPageSegmentImage(image, tenantId, `${key}-${index}`);

        if (metadata?.imageDriveFileId) {
          uploadedKeys.push(metadata.imageDriveFileId);
          if (existingSlide?.imageDriveFileId) replacedKeys.push(existingSlide.imageDriveFileId);
        } else if (slide.removeImage && existingSlide?.imageDriveFileId) {
          replacedKeys.push(existingSlide.imageDriveFileId);
        }

        return {
          text: slide.text,
          sortOrder: slide.sortOrder ?? index,
          ...(!metadata && !slide.removeImage && existingSlide
            ? {
                imageName: existingSlide.imageName,
                imageMimeType: existingSlide.imageMimeType,
                imageSize: existingSlide.imageSize,
                imageDriveFileId: existingSlide.imageDriveFileId
              }
            : {}),
          ...metadata
        };
      })
    );
  }

  private adminProfileResponse(admin: UserResponse) {
    return {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      tenantId: admin.tenantId
    };
  }

  private headerSettingsResponse(settings: TenantAdminSettings) {
    return {
      deliveryHeadline: settings.deliveryHeadline,
      logoUrl: settings.logoUrl,
      supportPhoneCountryCode: settings.supportPhoneCountryCode,
      supportPhoneNumber: settings.supportPhoneNumber,
      topBarTagline: settings.topBarTagline
    };
  }

  private async requireTenantProduct(tenantId: string, productId: string): Promise<void> {
    const { ProductModel } = this.models(tenantId);
    const product = await ProductModel.exists({
      _id: productId,
      tenantId,
      isDeleted: { $ne: true }
    });
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
  }

  private async requireTenantCategory(tenantId: string, categoryId: string): Promise<void> {
    const { CategoryModel } = this.models(tenantId);
    const category = await CategoryModel.exists({
      _id: categoryId,
      tenantId,
      isDeleted: { $ne: true }
    });
    if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Primary category not found');
  }

  private normalizeSecondaryCategoryProductIds(
    payload: Partial<Omit<SecondaryCategory, 'productIds'> & { productIds: string[] | string }>
  ): string[] {
    const productIds = Array.isArray(payload.productIds)
      ? payload.productIds
      : payload.productId
        ? [payload.productId]
        : [];
    const normalizedProductIds = [
      ...new Set(
        productIds
          .flatMap((productId) => String(productId).split(','))
          .map((productId) => productId.trim())
          .filter(Boolean)
      )
    ];

    if (!normalizedProductIds.length) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Select at least one product.');
    }

    return normalizedProductIds;
  }

  private secondaryCategoryResponse(category: SecondaryCategory): SecondaryCategory {
    const productIds = this.normalizeSecondaryCategoryProductIds(category);

    return {
      ...category,
      productId: category.productId ?? productIds[0],
      productIds
    };
  }

  private async requireTenantProducts(tenantId: string, productIds: string[]): Promise<void> {
    const { ProductModel } = this.models(tenantId);
    const products = await ProductModel.find({
      _id: { $in: productIds },
      tenantId,
      isDeleted: { $ne: true }
    })
      .select({ _id: 1 })
      .lean<Array<{ _id: string }>>();
    const foundProductIds = new Set(products.map((product) => String(product._id)));
    let missingProductIds = productIds.filter((productId) => !foundProductIds.has(productId));

    if (missingProductIds.length) {
      const tenantScopedProducts = await ProductModel.find({
        _id: { $in: missingProductIds },
        isDeleted: { $ne: true }
      })
        .select({ _id: 1 })
        .lean<Array<{ _id: string }>>();
      const tenantScopedProductIds = new Set(
        tenantScopedProducts.map((product) => String(product._id))
      );
      missingProductIds = missingProductIds.filter(
        (productId) => !tenantScopedProductIds.has(productId)
      );
    }

    if (missingProductIds.length) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'One or more selected products were not found');
    }
  }

  async listCategories(tenantId?: string, query: ListQuery = {}) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel } = this.models(scopedTenant);
    const filter: Record<string, unknown> = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { slug: regex }, { icon: regex }, { subcategories: regex }];
    }
    const categories = await CategoryModel.find(filter).sort({ name: 1 }).lean();
    return this.categoriesWithItemCounts(scopedTenant, categories);
  }

  async createCategory(tenantId: string | undefined, payload: Record<string, unknown>) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel } = this.models(scopedTenant);
    const name = String(payload.name);
    try {
      const category = await CategoryModel.create({
        ...payload,
        slug: typeof payload.slug === 'string' ? payload.slug : slugify(name),
        itemCount: 0,
        subcategories: Array.isArray(payload.subcategories)
          ? this.uniqueSubcategories(payload.subcategories)
          : [],
        tenantId: scopedTenant
      } as never);
      return category.toObject();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Category slug already exists for tenant');
      }

      throw error;
    }
  }

  async updateCategory(tenantId: string | undefined, id: string, payload: Record<string, unknown>) {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel } = this.models(scopedTenant);
    const updatePayload = {
      ...payload,
      ...(Array.isArray(payload.subcategories)
        ? { subcategories: this.uniqueSubcategories(payload.subcategories) }
        : {}),
      ...(typeof payload.name === 'string' && typeof payload.slug !== 'string'
        ? { slug: slugify(payload.name) }
        : {})
    };
    try {
      const category = await CategoryModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        updatePayload,
        { new: true }
      ).lean();
      if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
      const [categoryWithCount] = await this.categoriesWithItemCounts(scopedTenant, [
        category as Category
      ]);
      return categoryWithCount;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Category slug already exists for tenant');
      }

      throw error;
    }
  }

  private uniqueSubcategories(value: unknown[]): string[] {
    const seen = new Set<string>();
    const subcategories = value.map((item) => String(item).trim()).filter(Boolean);

    for (const subcategory of subcategories) {
      const key = subcategory.toLowerCase();
      if (seen.has(key)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Duplicate subcategory under primary category');
      }
      seen.add(key);
    }

    return subcategories;
  }

  async deleteCategory(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const { CategoryModel, ProductModel } = this.models(scopedTenant);
    const category = await CategoryModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Category>();
    if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');

    const referencedProducts = await ProductModel.exists({
      tenantId: scopedTenant,
      isDeleted: { $ne: true },
      $or: [{ categoryId: id }, { categoryName: category.name }]
    });
    if (referencedProducts) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Category is assigned to products and cannot be deleted'
      );
    }

    const result = await CategoryModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    return { id };
  }

  private async findTenant(tenantId: string) {
    const filter = isValidObjectId(tenantId) ? { _id: tenantId } : { slug: tenantId };
    return TenantModel.findOne({ ...filter, isDeleted: { $ne: true } }).lean();
  }

  private orderResponse(order: Order): Order {
    return {
      ...order,
      itemCount: order.itemCount ?? order.itemsCount ?? 0
    };
  }

  private async categoriesWithItemCounts(tenantId: string, categories: Category[]) {
    const { ProductModel } = this.models(tenantId);
    const categoryIds = categories.map((category) => String(category._id));
    const categoryNames = categories.map((category) => category.name);
    const counts = await ProductModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          tenantId,
          isDeleted: { $ne: true },
          $or: [{ categoryId: { $in: categoryIds } }, { categoryName: { $in: categoryNames } }]
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$categoryId', '$categoryName'] },
          count: { $sum: 1 }
        }
      }
    ]);
    const countByKey = new Map(counts.map((item) => [String(item._id), item.count]));

    return categories.map((category) => ({
      ...category,
      itemCount: countByKey.get(String(category._id)) ?? countByKey.get(String(category.name)) ?? 0
    }));
  }

  private customerStatsFromOrders(orders: Order[]): AdminCustomer[] {
    const customers = new Map<string, AdminCustomer>();

    for (const order of orders) {
      if (!order.customerEmail) continue;

      const key = order.customerEmail.toLowerCase();
      const existing = customers.get(key);
      const placedAt = new Date(order.placedAt || order.createdAt);
      const totalSpend = order.status === 'cancelled' ? 0 : order.totalAmount;

      if (!existing) {
        customers.set(key, {
          _id: key,
          tenantId: order.tenantId,
          name: order.customerName,
          email: key,
          orders: 1,
          totalSpend,
          lastOrderAt: placedAt,
          segment: 'New',
          isDeleted: false,
          createdAt: placedAt,
          updatedAt: placedAt
        });
        continue;
      }

      existing.orders += 1;
      existing.totalSpend += totalSpend;
      if (placedAt > new Date(existing.lastOrderAt)) existing.lastOrderAt = placedAt;
    }

    return [...customers.values()].map((customer) => ({
      ...customer,
      segment: this.customerSegment(customer)
    }));
  }

  private customerSegment(
    customer: Pick<AdminCustomer, 'orders' | 'totalSpend' | 'lastOrderAt'>
  ): AdminCustomer['segment'] {
    const daysSinceLastOrder =
      (Date.now() - new Date(customer.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastOrder > 90) return 'At Risk';
    if (customer.totalSpend >= 1000 || customer.orders >= 8) return 'VIP';
    if (customer.orders >= 2) return 'Loyal';
    return 'New';
  }

  private requireTenantId(tenantId?: string): string {
    if (!tenantId) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'x-tenant-id header is required');
    return tenantId;
  }

  async listOrders(tenantId?: string, query: ListQuery = {}): Promise<Order[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { OrderModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
        { region: regex },
        { township: regex }
      ];
    }
    if (typeof query.status === 'string' && query.status) filter.status = query.status;
    if (typeof query.region === 'string' && query.region) filter.region = query.region;
    if (typeof query.township === 'string' && query.township) filter.township = query.township;
    const from = query.from || query.startDate;
    const to = query.to || query.endDate;
    if (from || to)
      filter.placedAt = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {})
      };
    const orders = await OrderModel.find(filter).sort({ placedAt: -1 }).lean<Order[]>();
    return orders.map((order) => this.orderResponse(order));
  }

  async orderStats(tenantId?: string): Promise<Record<string, number>> {
    const scopedTenant = this.tenantId(tenantId);
    const { OrderModel } = this.models(scopedTenant);
    const orders = await OrderModel.find({ tenantId: scopedTenant }).lean<Order[]>();
    return {
      openOrders: orders.filter(
        (order) => !['delivered', 'fulfilled', 'cancelled'].includes(order.status)
      ).length,
      fulfilled: orders.filter((order) => ['delivered', 'fulfilled'].includes(order.status)).length,
      netRevenue: orders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    };
  }

  async updateOrderStatus(
    tenantId: string | undefined,
    id: string,
    status: Order['status']
  ): Promise<Order> {
    const scopedTenant = this.tenantId(tenantId);
    const { OrderModel } = this.models(scopedTenant);
    const order = await OrderModel.findOneAndUpdate(
      { _id: id, tenantId: scopedTenant },
      { status },
      { new: true }
    ).lean<Order>();
    if (!order) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found');
    return this.orderResponse(order);
  }

  async listCustomers(tenantId?: string, query: ListQuery = {}): Promise<AdminCustomer[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { OrderModel, AdminCustomerModel } = this.models(scopedTenant);
    const orderCustomers = this.customerStatsFromOrders(
      await OrderModel.find({ tenantId: scopedTenant }).lean<Order[]>()
    );
    let customers = orderCustomers;

    if (customers.length === 0) {
      customers = await AdminCustomerModel.find({
        tenantId: scopedTenant,
        isDeleted: { $ne: true }
      })
        .sort({ lastOrderAt: -1 })
        .lean<AdminCustomer[]>();
    }

    if (typeof query.search === 'string' && query.search) {
      const search = query.search.toLowerCase();
      customers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(search) ||
          customer.email.toLowerCase().includes(search) ||
          customer.segment.toLowerCase().includes(search)
      );
    }
    if (typeof query.segment === 'string' && query.segment)
      customers = customers.filter((customer) => customer.segment === query.segment);
    return customers.sort(
      (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
    );
  }

  async listPromotions(tenantId?: string, query: ListQuery = {}): Promise<Promotion[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { PromotionModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ campaign: regex }, { code: regex }, { discount: regex }];
    }
    return PromotionModel.find(filter).sort({ startsAt: -1 }).lean<Promotion[]>();
  }

  async createPromotion(
    tenantId: string | undefined,
    payload: Partial<Promotion>
  ): Promise<Promotion> {
    const scopedTenant = this.tenantId(tenantId);
    const { PromotionModel } = this.models(scopedTenant);
    try {
      return await PromotionModel.create({ ...payload, tenantId: scopedTenant }).then(
        (document) => document.toObject() as Promotion
      );
    } catch (error) {
      if (isDuplicateKeyError(error))
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Promotion code already exists for tenant');
      throw error;
    }
  }

  async updatePromotion(
    tenantId: string | undefined,
    id: string,
    payload: Partial<Promotion>
  ): Promise<Promotion> {
    const scopedTenant = this.tenantId(tenantId);
    const { PromotionModel } = this.models(scopedTenant);
    const promotion = await PromotionModel.findOneAndUpdate(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<Promotion>();
    if (!promotion) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Promotion not found');
    return promotion;
  }

  async deletePromotion(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.tenantId(tenantId);
    const { PromotionModel } = this.models(scopedTenant);
    const result = await PromotionModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Promotion not found');
    return { id };
  }

  async listRegions(tenantId?: string, query: ListQuery = {}): Promise<Region[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };

    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { status: regex }];
    }

    filter.$and = [{ $or: [{ country: 'Myanmar' }, { country: { $exists: false } }] }];

    if (typeof query.status === 'string' && query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    return RegionModel.find(filter).sort({ name: 1 }).lean<Region[]>();
  }

  async createRegion(tenantId: string | undefined, payload: Partial<Region>): Promise<Region> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel } = this.models(scopedTenant);

    try {
      return await RegionModel.create({
        country: 'Myanmar',
        name: String(payload.name ?? '').trim(),
        status: payload.status ?? 'active',
        tenantId: scopedTenant
      }).then((document) => document.toObject() as Region);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Region already exists');
      }

      throw error;
    }
  }

  async updateRegion(
    tenantId: string | undefined,
    id: string,
    payload: Partial<Region>
  ): Promise<Region> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel, TownshipModel, DeliveryFeeModel } = this.models(scopedTenant);
    const existingRegion = await RegionModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Region>();
    if (!existingRegion) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Region not found');

    const nextName = typeof payload.name === 'string' ? payload.name.trim() : existingRegion.name;

    try {
      const region = await RegionModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        { country: 'Myanmar', name: nextName, status: payload.status ?? existingRegion.status },
        { new: true }
      ).lean<Region>();
      if (!region) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Region not found');

      if (nextName !== existingRegion.name) {
        await Promise.all([
          TownshipModel.updateMany(
            {
              tenantId: scopedTenant,
              isDeleted: { $ne: true },
              $or: [{ regionId: existingRegion._id }, { region: existingRegion.name }]
            },
            { region: nextName }
          ),
          DeliveryFeeModel.updateMany(
            { tenantId: scopedTenant, region: existingRegion.name, isDeleted: { $ne: true } },
            { region: nextName }
          )
        ]);
      }

      return region;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Region already exists');
      }

      throw error;
    }
  }

  async deleteRegion(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel, TownshipModel, DeliveryFeeModel } = this.models(scopedTenant);
    const region = await RegionModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Region>();
    if (!region) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Region not found');

    const [referencedTownship, referencedDeliveryFee] = await Promise.all([
      TownshipModel.exists({
        tenantId: scopedTenant,
        isDeleted: { $ne: true }
      }).or([{ regionId: region._id }, { region: region.name }]),
      DeliveryFeeModel.exists({
        tenantId: scopedTenant,
        region: region.name,
        isDeleted: { $ne: true }
      })
    ]);

    if (referencedTownship || referencedDeliveryFee) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Region is in use and cannot be deleted');
    }

    await RegionModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    return { id };
  }

  async listTownships(tenantId?: string, query: ListQuery = {}): Promise<Township[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { TownshipModel } = this.models(scopedTenant);
    const filter: MongoFilter = {
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    };

    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { region: regex }, { status: regex }];
    }

    filter.$and = [{ $or: [{ country: 'Myanmar' }, { country: { $exists: false } }] }];

    if (typeof query.region === 'string' && query.region) filter.region = query.region;
    if (typeof query.regionId === 'string' && query.regionId) filter.regionId = query.regionId;
    if (typeof query.status === 'string' && query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    return TownshipModel.find(filter).sort({ region: 1, name: 1 }).lean<Township[]>();
  }

  async createTownship(
    tenantId: string | undefined,
    payload: Partial<Township>
  ): Promise<Township> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel, TownshipModel } = this.models(scopedTenant);
    const regionId = String(payload.regionId ?? '').trim();
    if (!isValidObjectId(regionId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'A valid Myanmar region is required');
    }

    const region = await RegionModel.findOne({
      _id: regionId,
      tenantId: scopedTenant,
      isDeleted: { $ne: true },
      $or: [{ country: 'Myanmar' }, { country: { $exists: false } }]
    }).lean<Region>();
    if (!region) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'A valid Myanmar region is required');

    try {
      return await TownshipModel.create({
        country: 'Myanmar',
        name: String(payload.name ?? '').trim(),
        region: region.name,
        regionId: region._id,
        status: payload.status ?? 'active',
        tenantId: scopedTenant
      }).then((document) => document.toObject() as Township);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Township already exists in this region');
      }

      throw error;
    }
  }

  async updateTownship(
    tenantId: string | undefined,
    id: string,
    payload: Partial<Township>
  ): Promise<Township> {
    const scopedTenant = this.tenantId(tenantId);
    const { RegionModel, TownshipModel, DeliveryFeeModel } = this.models(scopedTenant);
    const existingTownship = await TownshipModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Township>();
    if (!existingTownship) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Township not found');

    const nextName = typeof payload.name === 'string' ? payload.name.trim() : existingTownship.name;
    const nextRegionId = String(payload.regionId ?? existingTownship.regionId ?? '').trim();
    if (!isValidObjectId(nextRegionId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'A valid Myanmar region is required');
    }

    const nextRegion = await RegionModel.findOne({
      _id: nextRegionId,
      tenantId: scopedTenant,
      isDeleted: { $ne: true },
      $or: [{ country: 'Myanmar' }, { country: { $exists: false } }]
    }).lean<Region>();
    if (!nextRegion) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'A valid Myanmar region is required');

    try {
      const township = await TownshipModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        {
          country: 'Myanmar',
          name: nextName,
          region: nextRegion.name,
          regionId: nextRegion._id,
          status: payload.status ?? existingTownship.status
        },
        { new: true }
      ).lean<Township>();
      if (!township) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Township not found');

      if (nextName !== existingTownship.name || nextRegion.name !== existingTownship.region) {
        await DeliveryFeeModel.updateMany(
          {
            tenantId: scopedTenant,
            region: existingTownship.region,
            township: existingTownship.name,
            isDeleted: { $ne: true }
          },
          { region: nextRegion.name, township: nextName }
        );
      }

      return township;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Township already exists in this region');
      }

      throw error;
    }
  }

  async deleteTownship(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.tenantId(tenantId);
    const { TownshipModel, DeliveryFeeModel } = this.models(scopedTenant);
    const township = await TownshipModel.findOne({
      _id: id,
      tenantId: scopedTenant,
      isDeleted: { $ne: true }
    }).lean<Township>();
    if (!township) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Township not found');

    const referencedDeliveryFee = await DeliveryFeeModel.exists({
      tenantId: scopedTenant,
      region: township.region,
      township: township.name,
      isDeleted: { $ne: true }
    });

    if (referencedDeliveryFee) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Township is in use and cannot be deleted');
    }

    await TownshipModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    return { id };
  }

  async listDeliveryFees(tenantId?: string, query: ListQuery = {}): Promise<DeliveryFee[]> {
    const scopedTenant = this.tenantId(tenantId);
    const { DeliveryFeeModel } = this.models(scopedTenant);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ region: regex }, { township: regex }, { eta: regex }, { status: regex }];
    }
    if (typeof query.region === 'string' && query.region) filter.region = query.region;
    return DeliveryFeeModel.find(filter).sort({ region: 1, township: 1 }).lean<DeliveryFee[]>();
  }

  async createDeliveryFee(
    tenantId: string | undefined,
    payload: Partial<DeliveryFee>
  ): Promise<DeliveryFee> {
    const scopedTenant = this.tenantId(tenantId);
    const { DeliveryFeeModel } = this.models(scopedTenant);
    try {
      return await DeliveryFeeModel.create({ ...payload, tenantId: scopedTenant }).then(
        (document) => document.toObject() as DeliveryFee
      );
    } catch (error) {
      if (isDuplicateKeyError(error))
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          'Delivery fee already exists for tenant and township'
        );
      throw error;
    }
  }

  async updateDeliveryFee(
    tenantId: string | undefined,
    id: string,
    payload: Partial<DeliveryFee>
  ): Promise<DeliveryFee> {
    const scopedTenant = this.tenantId(tenantId);
    const { DeliveryFeeModel } = this.models(scopedTenant);
    const fee = await DeliveryFeeModel.findOneAndUpdate(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<DeliveryFee>();
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery fee not found');
    return fee;
  }

  async deleteDeliveryFee(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.tenantId(tenantId);
    const { DeliveryFeeModel } = this.models(scopedTenant);
    const result = await DeliveryFeeModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery fee not found');
    return { id };
  }
}
