import { isValidObjectId } from 'mongoose';

import { CategoryModel } from '@modules/categories/category.model';
import { Category } from '@modules/categories/category.types';
import { Role } from '@common/enums/role.enum';
import { Order } from '@modules/orders/order.types';
import { OrderModel } from '@modules/orders/order.model';
import { ProductModel } from '@modules/products/product.model';
import { Product } from '@modules/products/product.types';
import { TenantModel } from '@modules/tenants/tenant.model';
import { UserModel } from '@modules/users/user.model';
import { UserResponse } from '@modules/users/user.types';
import { GoogleDriveService, ProductImageMetadata, StorefrontImageMetadata } from '@shared/services/google-drive.service';
import { ApiError } from '@utils/ApiError';
import { HTTP_STATUS } from '@core/response/http-status';
import {
  AdminCustomer,
  AdminCustomerModel,
  DeliveryFee,
  DeliveryFeeModel,
  Promotion,
  PromotionModel,
  StorefrontCarouselSlide,
  StorefrontCarouselSlideModel,
  StorefrontHighlightIcon,
  StorefrontHighlightIconModel,
  StorefrontProductSectionAssignment,
  StorefrontProductSectionAssignmentModel,
  TenantAdminSettings,
  TenantAdminSettingsModel
} from './admin.models';

const DEFAULT_TENANT = 'demo';
const LOW_STOCK_THRESHOLD = 40;

type ListQuery = Record<string, unknown>;
type MongoFilter = Record<string, unknown>;
type ProductPayload = Partial<Product> & { removeImage?: boolean };
type BulkProductPayload = {
  mode?: 'upsert' | 'create-only';
  products: ProductPayload[];
};
type AdminProfilePayload = Pick<UserResponse, 'firstName' | 'lastName' | 'email' | 'isActive'> &
  Pick<TenantAdminSettings, 'deliveryHeadline' | 'supportPhoneCountryCode' | 'supportPhoneNumber' | 'topBarTagline'>;
type CarouselPayload = Partial<StorefrontCarouselSlide> & { removeImage?: boolean };

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 11000;

const productImageFields = ['imageName', 'imageMimeType', 'imageSize', 'imageDriveFileId', 'imageUrl', 'removeImage'] as const;
const carouselImageFields = ['imageName', 'imageMimeType', 'imageSize', 'imageDriveFileId', 'imageUrl', 'removeImage'] as const;

const productSections = [
  { id: 'top-offers', title: 'Top Offers', description: 'Promoted offers and seasonal savings.' },
  { id: 'top-blooms', title: 'Top Blooms', description: 'Fresh picks and customer favorites.' },
  { id: 'new-season', title: 'New Season', description: 'Recently highlighted products for the current season.' },
  { id: 'pantry-ready', title: 'Pantry Ready', description: 'Everyday staples ready for the storefront.' }
] as const;

export class AdminService {
  constructor(private readonly googleDriveService = new GoogleDriveService()) {}

  tenantId(tenantId?: string): string {
    return tenantId || DEFAULT_TENANT;
  }

  async dashboard(tenantId?: string): Promise<Record<string, unknown>> {
    const scopedTenant = this.tenantId(tenantId);
    const [tenant, products, categories, orders, customers, promotions] = await Promise.all([
      this.findTenant(scopedTenant),
      ProductModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<Product[]>(),
      CategoryModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean(),
      OrderModel.find({ tenantId: scopedTenant }).sort({ placedAt: -1 }).lean<Order[]>(),
      AdminCustomerModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<AdminCustomer[]>(),
      PromotionModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true }, status: 'active' }).lean<Promotion[]>()
    ]);

    const revenue = orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.totalAmount, 0);
    const openOrders = orders.filter((order) => !['delivered', 'fulfilled', 'cancelled'].includes(order.status)).length;
    const lowStockProducts = products.filter((product) => product.stock <= LOW_STOCK_THRESHOLD);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySales = days.map((day) => ({ day, sales: 0 }));

    for (const order of orders) {
      const dayIndex = new Date(order.placedAt || order.createdAt).getDay();
      const bucket = weeklySales[dayIndex];
      if (bucket && order.status !== 'cancelled') bucket.sales += order.totalAmount;
    }

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
      weeklySales,
      workQueue: {
        ordersToFulfill: openOrders,
        lowStockSkus: lowStockProducts.length,
        activePromotions: promotions.length
      },
      inventoryAlerts: lowStockProducts.map((product) => ({ _id: product._id, name: product.name, sku: product.sku, stock: product.stock })),
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
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { sku: regex }, { categoryName: regex }, { subcategory: regex }, { description: regex }, { tags: regex }];
    }
    if (typeof query.status === 'string' && query.status) filter.status = query.status;
    if (typeof query.categoryId === 'string' && query.categoryId) filter.categoryId = query.categoryId;
    if (typeof query.categoryName === 'string' && query.categoryName) filter.categoryName = query.categoryName;
    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).lean<Product[]>();
    return Promise.all(products.map((product) => this.withProductImageUrl(product)));
  }

  async createProduct(tenantId: string | undefined, payload: ProductPayload, image?: Express.Multer.File): Promise<Product> {
    const scopedTenant = this.tenantId(tenantId);
    const productPayload = this.productPayload(payload);
    let imageMetadata: ProductImageMetadata | undefined;

    try {
      if (image) {
        imageMetadata = await this.uploadProductImage(image, scopedTenant, String(productPayload.sku || payload.sku || 'product'));
      }

      const product = await ProductModel.create({ ...productPayload, ...imageMetadata, tenantId: scopedTenant });
      return this.withProductImageUrl(product.toObject() as Product);
    } catch (error) {
      if (imageMetadata) await this.googleDriveService.deleteProductImage(imageMetadata.imageDriveFileId);
      throw error;
    }
  }

  async bulkImportProducts(tenantId: string | undefined, payload: BulkProductPayload) {
    const scopedTenant = this.requireTenantId(tenantId);
    const mode = payload.mode ?? 'upsert';
    const products = payload.products ?? [];
    const categories = await CategoryModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<Category[]>();
    const categoryById = new Map(categories.map((category) => [String(category._id), category]));
    const categoryByName = new Map(categories.map((category) => [category.name.toLowerCase(), category]));
    const categoryBySlug = new Map(categories.map((category) => [category.slug.toLowerCase(), category]));
    const seenSkus = new Set<string>();
    const skipped: Array<{ row: number; sku?: string; reason: string }> = [];
    const importable = products.flatMap((product, index) => {
      const row = index + 1;
      const sku = String(product.sku ?? '').trim();
      const skuKey = sku.toLowerCase();

      if (!sku) {
        skipped.push({ row, reason: 'SKU is required' });
        return [];
      }

      if (seenSkus.has(skuKey)) {
        skipped.push({ row, sku, reason: 'Duplicate SKU in import file' });
        return [];
      }

      seenSkus.add(skuKey);
      const category =
        (product.categoryId ? categoryById.get(String(product.categoryId)) : undefined) ??
        (product.categoryName ? categoryByName.get(product.categoryName.toLowerCase()) : undefined) ??
        (product.categoryName ? categoryBySlug.get(slugify(product.categoryName)) : undefined);
      const productPayload = this.productPayload({
        ...product,
        categoryId: category ? String(category._id) : product.categoryId,
        categoryName: category?.name ?? product.categoryName,
        currency: product.currency || 'USD',
        description: product.description || '',
        sku,
        status: product.status || 'active',
        tags: product.tags ?? []
      });

      return [{ row, sku, productPayload }];
    });
    const existingProducts = await ProductModel.find({
      tenantId: scopedTenant,
      sku: { $in: importable.map((item) => item.sku) }
    })
      .select('sku')
      .lean<Pick<Product, 'sku'>[]>();
    const existingSkus = new Set(existingProducts.map((product) => product.sku.toLowerCase()));
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

    if (operations.length > 0) {
      await ProductModel.bulkWrite(operations, { ordered: false });
    }

    const processedSkus = importable
      .filter(({ sku }) => !(mode === 'create-only' && existingSkus.has(sku.toLowerCase())))
      .map(({ sku }) => sku);

    return {
      created: processedSkus.filter((sku) => !existingSkus.has(sku.toLowerCase())).length,
      skipped,
      total: products.length,
      updated: processedSkus.filter((sku) => existingSkus.has(sku.toLowerCase())).length
    };
  }

  async updateProduct(tenantId: string | undefined, id: string, payload: ProductPayload, image?: Express.Multer.File): Promise<Product> {
    const scopedTenant = this.tenantId(tenantId);
    const filter = { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } };
    const productPayload = this.productPayload(payload);
    let imageMetadata: ProductImageMetadata | undefined;

    if (image || payload.removeImage) {
      const existingProduct = await ProductModel.findOne(filter).lean<Product>();
      if (!existingProduct) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

      if (image) {
        imageMetadata = await this.uploadProductImage(image, scopedTenant, String(productPayload.sku || existingProduct.sku));
      }

      const update = imageMetadata
        ? { ...productPayload, ...imageMetadata }
        : {
            $set: productPayload,
            $unset: {
              imageName: '',
              imageMimeType: '',
              imageSize: '',
              imageDriveFileId: ''
            }
          };

      try {
        const product = await ProductModel.findOneAndUpdate(filter, update, { new: true }).lean<Product>();
        if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');

        if (image || payload.removeImage) await this.googleDriveService.deleteProductImage(existingProduct.imageDriveFileId);
        return this.withProductImageUrl(product);
      } catch (error) {
        if (imageMetadata) await this.googleDriveService.deleteProductImage(imageMetadata.imageDriveFileId);
        throw error;
      }
    }

    const product = await ProductModel.findOneAndUpdate(filter, productPayload, { new: true }).lean<Product>();
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    return this.withProductImageUrl(product);
  }

  async deleteProduct(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const result = await ProductModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } }, { isDeleted: true });
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    return { id };
  }

  async getAdminProfile(tenantId: string | undefined, userId: string | undefined) {
    const scopedTenant = this.requireTenantId(tenantId);
    if (!userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');

    const [admin, headerSettings] = await Promise.all([
      UserModel.findOne({ _id: userId, tenantId: scopedTenant, role: Role.TENANT_ADMIN, isDeleted: { $ne: true } })
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

  async updateAdminProfile(tenantId: string | undefined, userId: string | undefined, payload: AdminProfilePayload) {
    const scopedTenant = this.requireTenantId(tenantId);
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

  async listCarousel(tenantId: string | undefined, query: ListQuery = {}): Promise<StorefrontCarouselSlide[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.placement === 'string' && query.placement && query.placement !== 'all') filter.placement = query.placement;
    const slides = await StorefrontCarouselSlideModel.find(filter).sort({ placement: 1, sortOrder: 1, createdAt: -1 }).lean<StorefrontCarouselSlide[]>();
    return Promise.all(slides.map((slide) => this.withCarouselImageUrl(slide)));
  }

  async createCarouselSlide(tenantId: string | undefined, payload: CarouselPayload, image?: Express.Multer.File): Promise<StorefrontCarouselSlide> {
    const scopedTenant = this.requireTenantId(tenantId);
    const slidePayload = this.carouselPayload(payload);
    let imageMetadata: StorefrontImageMetadata | undefined;

    try {
      if (image) imageMetadata = await this.uploadStorefrontImage(image, scopedTenant, String(slidePayload.placement || 'carousel'));
      const slide = await StorefrontCarouselSlideModel.create({ ...slidePayload, ...imageMetadata, tenantId: scopedTenant });
      return this.withCarouselImageUrl(slide.toObject() as StorefrontCarouselSlide);
    } catch (error) {
      if (imageMetadata) await this.googleDriveService.deleteProductImage(imageMetadata.imageDriveFileId);
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
    const filter = { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } };
    const slidePayload = this.carouselPayload(payload);
    let imageMetadata: StorefrontImageMetadata | undefined;

    if (image || payload.removeImage) {
      const existingSlide = await StorefrontCarouselSlideModel.findOne(filter).lean<StorefrontCarouselSlide>();
      if (!existingSlide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
      if (image) imageMetadata = await this.uploadStorefrontImage(image, scopedTenant, String(slidePayload.placement || existingSlide.placement));

      const update = imageMetadata
        ? { ...slidePayload, ...imageMetadata }
        : { $set: slidePayload, $unset: { imageName: '', imageMimeType: '', imageSize: '', imageDriveFileId: '' } };

      try {
        const slide = await StorefrontCarouselSlideModel.findOneAndUpdate(filter, update, { new: true }).lean<StorefrontCarouselSlide>();
        if (!slide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
        await this.googleDriveService.deleteProductImage(existingSlide.imageDriveFileId);
        return this.withCarouselImageUrl(slide);
      } catch (error) {
        if (imageMetadata) await this.googleDriveService.deleteProductImage(imageMetadata.imageDriveFileId);
        throw error;
      }
    }

    const slide = await StorefrontCarouselSlideModel.findOneAndUpdate(filter, slidePayload, { new: true }).lean<StorefrontCarouselSlide>();
    if (!slide) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
    return this.withCarouselImageUrl(slide);
  }

  async deleteCarouselSlide(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const result = await StorefrontCarouselSlideModel.updateOne({ _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } }, { isDeleted: true });
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carousel slide not found');
    return { id };
  }

  async listStorefrontIcons(tenantId: string | undefined, query: ListQuery = {}): Promise<StorefrontHighlightIcon[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    const filter: MongoFilter = { tenantId: scopedTenant, isDeleted: { $ne: true } };
    if (typeof query.section === 'string' && query.section && query.section !== 'all') filter.section = query.section;
    return StorefrontHighlightIconModel.find(filter).sort({ section: 1, sortOrder: 1, createdAt: -1 }).lean<StorefrontHighlightIcon[]>();
  }

  async createStorefrontIcon(tenantId: string | undefined, payload: Partial<StorefrontHighlightIcon>): Promise<StorefrontHighlightIcon> {
    const scopedTenant = this.requireTenantId(tenantId);
    return StorefrontHighlightIconModel.create({ ...payload, tenantId: scopedTenant }).then((document) => document.toObject() as StorefrontHighlightIcon);
  }

  async updateStorefrontIcon(tenantId: string | undefined, id: string, payload: Partial<StorefrontHighlightIcon>): Promise<StorefrontHighlightIcon> {
    const scopedTenant = this.requireTenantId(tenantId);
    const icon = await StorefrontHighlightIconModel.findOneAndUpdate(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<StorefrontHighlightIcon>();
    if (!icon) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Storefront icon not found');
    return icon;
  }

  async deleteStorefrontIcon(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const result = await StorefrontHighlightIconModel.updateOne({ _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } }, { isDeleted: true });
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Storefront icon not found');
    return { id };
  }

  async listProductSections(tenantId: string | undefined) {
    const scopedTenant = this.requireTenantId(tenantId);
    const assignments = await StorefrontProductSectionAssignmentModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } })
      .sort({ sectionId: 1, sortOrder: 1 })
      .lean<StorefrontProductSectionAssignment[]>();
    const productIds = [...new Set(assignments.map((assignment) => assignment.productId))];
    const products = await ProductModel.find({ _id: { $in: productIds }, tenantId: scopedTenant, isDeleted: { $ne: true } }).lean<Product[]>();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    return {
      sections: await Promise.all(
        productSections.map(async (section) => {
          const productsForSection = await Promise.all(
            assignments
              .filter((assignment) => assignment.sectionId === section.id)
              .map(async (assignment) => ({
                ...(productsById.has(assignment.productId) ? await this.withProductImageUrl(productsById.get(assignment.productId) as Product) : {}),
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
    await this.requireTenantProduct(scopedTenant, String(payload.productId));

    try {
      return await StorefrontProductSectionAssignmentModel.create({ ...payload, tenantId: scopedTenant }).then(
        (document) => document.toObject() as StorefrontProductSectionAssignment
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ApiError(HTTP_STATUS.CONFLICT, 'Product is already active in this section');
      throw error;
    }
  }

  async updateProductSectionAssignment(
    tenantId: string | undefined,
    id: string,
    payload: Partial<StorefrontProductSectionAssignment>
  ): Promise<StorefrontProductSectionAssignment> {
    const scopedTenant = this.requireTenantId(tenantId);
    if (payload.productId) await this.requireTenantProduct(scopedTenant, String(payload.productId));

    try {
      const assignment = await StorefrontProductSectionAssignmentModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        payload,
        { new: true }
      ).lean<StorefrontProductSectionAssignment>();
      if (!assignment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product section assignment not found');
      return assignment;
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ApiError(HTTP_STATUS.CONFLICT, 'Product is already active in this section');
      throw error;
    }
  }

  async deleteProductSectionAssignment(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const result = await StorefrontProductSectionAssignmentModel.updateOne(
      { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
      { isDeleted: true }
    );
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product section assignment not found');
    return { id };
  }

  async storefrontHeaderSettings(tenantId?: string) {
    const scopedTenant = this.requireTenantId(tenantId);
    return this.headerSettingsResponse(await this.getTenantAdminSettings(scopedTenant));
  }

  async storefrontCarousel(tenantId: string | undefined, placement: StorefrontCarouselSlide['placement']): Promise<StorefrontCarouselSlide[]> {
    const scopedTenant = this.requireTenantId(tenantId);
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

  async storefrontIcons(tenantId: string | undefined, section: StorefrontHighlightIcon['section']): Promise<StorefrontHighlightIcon[]> {
    const scopedTenant = this.requireTenantId(tenantId);
    return StorefrontHighlightIconModel.find({ tenantId: scopedTenant, section, status: 'active', isDeleted: { $ne: true } })
      .sort({ sortOrder: 1 })
      .lean<StorefrontHighlightIcon[]>();
  }

  async storefrontProductSections(tenantId?: string) {
    const scopedTenant = this.requireTenantId(tenantId);
    const assignments = await StorefrontProductSectionAssignmentModel.find({ tenantId: scopedTenant, status: 'active', isDeleted: { $ne: true } })
      .sort({ sortOrder: 1 })
      .lean<StorefrontProductSectionAssignment[]>();
    const productIds = [...new Set(assignments.map((assignment) => assignment.productId))];
    const products = await ProductModel.find({ _id: { $in: productIds }, tenantId: scopedTenant, status: 'active', isDeleted: { $ne: true } }).lean<Product[]>();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    return {
      sections: await Promise.all(
        productSections.map(async (section) => ({
          ...section,
          products: await Promise.all(
            assignments
              .filter((assignment) => assignment.sectionId === section.id && productsById.has(assignment.productId))
              .map(async (assignment) => ({
                ...(await this.withProductImageUrl(productsById.get(assignment.productId) as Product)),
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

  private productPayload(payload: ProductPayload): Partial<Product> {
    const sanitizedPayload = { ...payload };

    for (const field of productImageFields) {
      delete sanitizedPayload[field];
    }

    return sanitizedPayload;
  }

  private carouselPayload(payload: CarouselPayload): Partial<StorefrontCarouselSlide> {
    const sanitizedPayload = { ...payload };

    for (const field of carouselImageFields) {
      delete sanitizedPayload[field];
    }

    return sanitizedPayload;
  }

  private async uploadProductImage(image: Express.Multer.File, tenantId: string, sku: string): Promise<ProductImageMetadata> {
    try {
      return await this.googleDriveService.uploadProductImage(image, tenantId, sku);
    } catch {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to upload product image. Please try again.');
    }
  }

  private async uploadStorefrontImage(image: Express.Multer.File, tenantId: string, reference: string): Promise<StorefrontImageMetadata> {
    try {
      return await this.googleDriveService.uploadStorefrontImage(image, tenantId, reference);
    } catch {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to upload storefront image. Please try again.');
    }
  }

  private async withProductImageUrl(product: Product): Promise<Product> {
    const imageUrl = await this.googleDriveService.getProductImageUrl(product.imageDriveFileId, product.imageName);
    return { ...product, imageUrl };
  }

  private async withCarouselImageUrl(slide: StorefrontCarouselSlide): Promise<StorefrontCarouselSlide> {
    const imageUrl = await this.googleDriveService.getProductImageUrl(slide.imageDriveFileId, slide.imageName);
    return { ...slide, imageUrl };
  }

  private async getTenantAdminSettings(tenantId: string): Promise<TenantAdminSettings> {
    const settings = await TenantAdminSettingsModel.findOneAndUpdate(
      { tenantId, isDeleted: { $ne: true } },
      { $setOnInsert: { tenantId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean<TenantAdminSettings>();

    return settings;
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
      supportPhoneCountryCode: settings.supportPhoneCountryCode,
      supportPhoneNumber: settings.supportPhoneNumber,
      topBarTagline: settings.topBarTagline
    };
  }

  private async requireTenantProduct(tenantId: string, productId: string): Promise<void> {
    const product = await ProductModel.exists({ _id: productId, tenantId, isDeleted: { $ne: true } });
    if (!product) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Product does not exist for this tenant');
  }

  async listCategories(tenantId?: string, query: ListQuery = {}) {
    const scopedTenant = this.requireTenantId(tenantId);
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
    const name = String(payload.name);
    try {
      const category = await CategoryModel.create({
        ...payload,
        slug: typeof payload.slug === 'string' ? payload.slug : slugify(name),
        itemCount: 0,
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
    try {
      const category = await CategoryModel.findOneAndUpdate(
        { _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } },
        {
          ...payload,
          ...(typeof payload.name === 'string' && typeof payload.slug !== 'string' ? { slug: slugify(payload.name) } : {})
        },
        { new: true }
      ).lean();
      if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
      const [categoryWithCount] = await this.categoriesWithItemCounts(scopedTenant, [category as Category]);
      return categoryWithCount;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Category slug already exists for tenant');
      }

      throw error;
    }
  }

  async deleteCategory(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const scopedTenant = this.requireTenantId(tenantId);
    const result = await CategoryModel.updateOne({ _id: id, tenantId: scopedTenant, isDeleted: { $ne: true } }, { isDeleted: true });
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

  private customerSegment(customer: Pick<AdminCustomer, 'orders' | 'totalSpend' | 'lastOrderAt'>): AdminCustomer['segment'] {
    const daysSinceLastOrder = (Date.now() - new Date(customer.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
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
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId) };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ orderNumber: regex }, { customerName: regex }, { customerEmail: regex }, { customerPhone: regex }, { region: regex }, { township: regex }];
    }
    if (typeof query.status === 'string' && query.status) filter.status = query.status;
    if (typeof query.region === 'string' && query.region) filter.region = query.region;
    if (typeof query.township === 'string' && query.township) filter.township = query.township;
    if (query.from || query.to) filter.placedAt = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) };
    const orders = await OrderModel.find(filter).sort({ placedAt: -1 }).lean<Order[]>();
    return orders.map((order) => this.orderResponse(order));
  }

  async orderStats(tenantId?: string): Promise<Record<string, number>> {
    const orders = await OrderModel.find({ tenantId: this.tenantId(tenantId) }).lean<Order[]>();
    return {
      openOrders: orders.filter((order) => !['delivered', 'fulfilled', 'cancelled'].includes(order.status)).length,
      fulfilled: orders.filter((order) => ['delivered', 'fulfilled'].includes(order.status)).length,
      netRevenue: orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.totalAmount, 0)
    };
  }

  async updateOrderStatus(tenantId: string | undefined, id: string, status: Order['status']): Promise<Order> {
    const order = await OrderModel.findOneAndUpdate({ _id: id, tenantId: this.tenantId(tenantId) }, { status }, { new: true }).lean<Order>();
    if (!order) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found');
    return this.orderResponse(order);
  }

  async listCustomers(tenantId?: string, query: ListQuery = {}): Promise<AdminCustomer[]> {
    const scopedTenant = this.tenantId(tenantId);
    const orderCustomers = this.customerStatsFromOrders(await OrderModel.find({ tenantId: scopedTenant }).lean<Order[]>());
    let customers = orderCustomers;

    if (customers.length === 0) {
      customers = await AdminCustomerModel.find({ tenantId: scopedTenant, isDeleted: { $ne: true } })
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
    if (typeof query.segment === 'string' && query.segment) customers = customers.filter((customer) => customer.segment === query.segment);
    return customers.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
  }

  async listPromotions(tenantId?: string, query: ListQuery = {}): Promise<Promotion[]> {
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ campaign: regex }, { code: regex }, { discount: regex }];
    }
    return PromotionModel.find(filter).sort({ startsAt: -1 }).lean<Promotion[]>();
  }

  async createPromotion(tenantId: string | undefined, payload: Partial<Promotion>): Promise<Promotion> {
    try {
      return await PromotionModel.create({ ...payload, tenantId: this.tenantId(tenantId) }).then((document) => document.toObject() as Promotion);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ApiError(HTTP_STATUS.CONFLICT, 'Promotion code already exists for tenant');
      throw error;
    }
  }

  async updatePromotion(tenantId: string | undefined, id: string, payload: Partial<Promotion>): Promise<Promotion> {
    const promotion = await PromotionModel.findOneAndUpdate(
      { _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<Promotion>();
    if (!promotion) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Promotion not found');
    return promotion;
  }

  async deletePromotion(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const result = await PromotionModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } }, { isDeleted: true });
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Promotion not found');
    return { id };
  }

  async listDeliveryFees(tenantId?: string, query: ListQuery = {}): Promise<DeliveryFee[]> {
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ region: regex }, { township: regex }, { eta: regex }, { status: regex }];
    }
    if (typeof query.region === 'string' && query.region) filter.region = query.region;
    return DeliveryFeeModel.find(filter).sort({ region: 1, township: 1 }).lean<DeliveryFee[]>();
  }

  async createDeliveryFee(tenantId: string | undefined, payload: Partial<DeliveryFee>): Promise<DeliveryFee> {
    try {
      return await DeliveryFeeModel.create({ ...payload, tenantId: this.tenantId(tenantId) }).then((document) => document.toObject() as DeliveryFee);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ApiError(HTTP_STATUS.CONFLICT, 'Delivery fee already exists for tenant and township');
      throw error;
    }
  }

  async updateDeliveryFee(tenantId: string | undefined, id: string, payload: Partial<DeliveryFee>): Promise<DeliveryFee> {
    const fee = await DeliveryFeeModel.findOneAndUpdate(
      { _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<DeliveryFee>();
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery fee not found');
    return fee;
  }

  async deleteDeliveryFee(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    const result = await DeliveryFeeModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } }, { isDeleted: true });
    if (result.matchedCount === 0) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery fee not found');
    return { id };
  }
}
