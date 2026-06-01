import { CategoryModel } from '@modules/categories/category.model';
import { Order } from '@modules/orders/order.types';
import { OrderModel } from '@modules/orders/order.model';
import { ProductModel } from '@modules/products/product.model';
import { Product } from '@modules/products/product.types';
import { ApiError } from '@utils/ApiError';
import { HTTP_STATUS } from '@core/response/http-status';
import { AdminCustomer, AdminCustomerModel, DeliveryFee, DeliveryFeeModel, Promotion, PromotionModel } from './admin.models';

const DEFAULT_TENANT = 'demo';
const LOW_STOCK_THRESHOLD = 40;

type ListQuery = Record<string, unknown>;
type MongoFilter = Record<string, unknown>;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export class AdminService {
  tenantId(tenantId?: string): string {
    return tenantId || DEFAULT_TENANT;
  }

  async dashboard(tenantId?: string): Promise<Record<string, unknown>> {
    const scopedTenant = this.tenantId(tenantId);
    const [products, categories, orders, customers, promotions] = await Promise.all([
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
      tenant: { name: "AV's Store", subtitle: "AV's Store Demo", status: 'growth' },
      totals: {
        catalogItems: products.length,
        categories: categories.length,
        orders: orders.length,
        revenue,
        customers: customers.length
      },
      weeklySales,
      workQueue: {
        ordersToFulfill: openOrders,
        lowStockSkus: lowStockProducts.length,
        activePromotions: promotions.length
      },
      inventoryAlerts: lowStockProducts.map((product) => ({ id: product._id, name: product.name, stock: product.stock })),
      recentOrders: orders.slice(0, 5).map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status
      }))
    };
  }

  async listProducts(tenantId?: string, query: ListQuery = {}): Promise<Product[]> {
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { sku: regex }, { description: regex }, { tags: regex }];
    }
    if (typeof query.category === 'string' && query.category) filter.categoryName = query.category;
    if (query.stock === 'low') filter.stock = { $lte: LOW_STOCK_THRESHOLD };
    if (typeof query.rating === 'string' && query.rating) filter.rating = { $gte: Number(query.rating) };
    return ProductModel.find(filter).sort({ createdAt: -1 }).lean<Product[]>();
  }

  async createProduct(tenantId: string | undefined, payload: Partial<Product>): Promise<Product> {
    return ProductModel.create({ ...payload, tenantId: this.tenantId(tenantId) }).then((document) => document.toObject() as Product);
  }

  async updateProduct(tenantId: string | undefined, id: string, payload: Partial<Product>): Promise<Product> {
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean<Product>();
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    return product;
  }

  async deleteProduct(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    await ProductModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId) }, { isDeleted: true });
    return { id };
  }

  async listCategories(tenantId?: string, query: ListQuery = {}) {
    const filter: Record<string, unknown> = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { slug: regex }, { icon: regex }, { subcategories: regex }];
    }
    return CategoryModel.find(filter).sort({ name: 1 }).lean();
  }

  async createCategory(tenantId: string | undefined, payload: Record<string, unknown>) {
    const name = String(payload.name);
    const category = await CategoryModel.create({
      ...payload,
      slug: typeof payload.slug === 'string' ? payload.slug : slugify(name),
      tenantId: this.tenantId(tenantId)
    } as never);
    return category.toObject();
  }

  async updateCategory(tenantId: string | undefined, id: string, payload: Record<string, unknown>) {
    const category = await CategoryModel.findOneAndUpdate(
      { _id: id, tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } },
      payload,
      { new: true }
    ).lean();
    if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    return category;
  }

  async deleteCategory(tenantId: string | undefined, id: string): Promise<{ id: string }> {
    await CategoryModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId) }, { isDeleted: true });
    return { id };
  }

  async listOrders(tenantId?: string, query: ListQuery = {}): Promise<Order[]> {
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId) };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ orderNumber: regex }, { customerName: regex }, { customerPhone: regex }, { township: regex }];
    }
    if (typeof query.status === 'string' && query.status) filter.status = query.status;
    if (query.from || query.to) filter.placedAt = { ...(query.from ? { $gte: query.from } : {}), ...(query.to ? { $lte: query.to } : {}) };
    return OrderModel.find(filter).sort({ placedAt: -1 }).lean<Order[]>();
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
    return order;
  }

  async listCustomers(tenantId?: string, query: ListQuery = {}): Promise<AdminCustomer[]> {
    const filter: MongoFilter = { tenantId: this.tenantId(tenantId), isDeleted: { $ne: true } };
    if (typeof query.search === 'string' && query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { segment: regex }];
    }
    if (typeof query.segment === 'string' && query.segment) filter.segment = query.segment;
    return AdminCustomerModel.find(filter).sort({ lastOrderAt: -1 }).lean<AdminCustomer[]>();
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
    return PromotionModel.create({ ...payload, tenantId: this.tenantId(tenantId) }).then((document) => document.toObject() as Promotion);
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
    await PromotionModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId) }, { isDeleted: true });
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
    return DeliveryFeeModel.create({ ...payload, tenantId: this.tenantId(tenantId) }).then((document) => document.toObject() as DeliveryFee);
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
    await DeliveryFeeModel.updateOne({ _id: id, tenantId: this.tenantId(tenantId) }, { isDeleted: true });
    return { id };
  }
}
