import { BaseService } from '@core/base/BaseService';
import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order, OrderLineItem } from '@modules/orders/order.types';
import { ApiError } from '@utils/ApiError';

type CreateOrderInput = Pick<
  Order,
  | 'city'
  | 'customerEmail'
  | 'customerName'
  | 'customerPhone'
  | 'deliveryAddress'
  | 'itemCount'
  | 'paymentMethod'
  | 'productIds'
  | 'region'
  | 'subtotalAmount'
  | 'township'
> & {
  items: Array<{ productId: string; quantity: number }>;
};

type DeliveryQuoteInput = {
  city: string;
  region: string;
  subtotalAmount: number;
  township: string;
};

export class OrderService extends BaseService {
  constructor() {
    super();
  }

  async listOrders(tenantId?: string, userId?: string): Promise<Order[]> {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authenticated user context is required');
    }

    const { UserModel } = getTenantModels(tenantId);
    const user = await UserModel.findOne({
      _id: userId,
      tenantId,
      isActive: true,
      isDeleted: { $ne: true }
    }).lean();

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User session is no longer active');
    }

    const orders = await new OrderRepository(tenantId).findNewestFirst({
      customerEmail: user.email.trim().toLowerCase(),
      tenantId,
      userId
    });
    const legacyProductIds = [
      ...new Set(
        orders
          .filter((order) => !order.lineItems?.length)
          .flatMap((order) => order.productIds ?? [])
          .map(String)
      )
    ];

    if (legacyProductIds.length === 0) return orders;

    const { ProductModel } = getTenantModels(tenantId);
    const products = await ProductModel.find({
      _id: { $in: legacyProductIds },
      tenantId,
      isDeleted: { $ne: true }
    })
      .select('_id imageUrl name sku')
      .lean();
    const productById = new Map(products.map((product) => [String(product._id), product]));

    return orders.map((order) => {
      if (order.lineItems?.length) return order;

      return {
        ...order,
        productDetails: [...new Set(order.productIds ?? [])].flatMap((productId) => {
          const product = productById.get(String(productId));
          return product
            ? [
                {
                  imageUrl: product.imageUrl ?? undefined,
                  name: product.name,
                  productId: String(product._id),
                  sku: product.sku
                }
              ]
            : [];
        })
      };
    });
  }

  async getDeliveryQuote(
    tenantId: string | undefined,
    userId: string | undefined,
    payload: DeliveryQuoteInput
  ) {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authenticated user context is required');
    }

    const { DeliveryFeeModel } = getTenantModels(tenantId);
    const configuration = await DeliveryFeeModel.findOne({
      tenantId,
      region: payload.region,
      township: payload.township,
      status: 'active',
      isDeleted: { $ne: true }
    }).lean();

    if (!configuration) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Delivery is not configured for ${payload.township}, ${payload.region}`
      );
    }

    const deliveryFee =
      configuration.freeOver > 0 && payload.subtotalAmount >= configuration.freeOver
        ? 0
        : configuration.fee;

    return {
      city: payload.city,
      deliveryFee,
      eta: configuration.eta,
      freeDeliveryApplied: deliveryFee === 0 && configuration.fee > 0,
      freeOver: configuration.freeOver,
      region: payload.region,
      subtotalAmount: payload.subtotalAmount,
      totalAmount: payload.subtotalAmount + deliveryFee,
      township: payload.township
    };
  }

  async createOrder(
    tenantId: string | undefined,
    userId: string | undefined,
    payload: CreateOrderInput
  ): Promise<Order> {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');
    }

    if (!payload.city || !payload.region || !payload.township) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'City, region, and township are required');
    }

    const quote = await this.getDeliveryQuote(tenantId, userId, {
      city: payload.city,
      region: payload.region,
      subtotalAmount: payload.subtotalAmount,
      township: payload.township
    });
    const itemCount = payload.itemCount;
    const orderNumber = `ORD-${Date.now()}`;
    const isWalletPayment = payload.paymentMethod === 'wallet';
    const { CategoryModel, CustomerWalletModel, ProductModel, UserModel } =
      getTenantModels(tenantId);
    const user = await UserModel.findOne({
      _id: userId,
      tenantId,
      isActive: true,
      isDeleted: { $ne: true }
    }).lean();

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User session is no longer active');
    }

    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const requestedItems = payload.items.length
      ? payload.items
      : payload.productIds.map((productId) => ({ productId, quantity: 1 }));
    const requestedProductIds = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await ProductModel.find({
      _id: { $in: requestedProductIds },
      tenantId,
      isDeleted: { $ne: true }
    })
      .select('_id categoryId categoryName imageUrl name price sku subcategory')
      .lean();
    const productById = new Map(products.map((product) => [String(product._id), product]));

    if (productById.size !== requestedProductIds.length) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'One or more ordered products are unavailable');
    }

    const orderedCategoryIds = [
      ...new Set(products.map((product) => String(product.categoryId ?? '')).filter(Boolean))
    ];
    const orderedCategories = await CategoryModel.find({
      _id: { $in: orderedCategoryIds },
      tenantId,
      isDeleted: { $ne: true }
    })
      .select('_id name')
      .lean();
    const categoryNameById = new Map(
      orderedCategories.map((category) => [String(category._id), category.name])
    );

    const lineItems: OrderLineItem[] = requestedItems.map(({ productId, quantity }) => {
      const product = productById.get(productId);

      if (!product) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'An ordered product is unavailable');
      }

      return {
        categoryId: product.categoryId ? String(product.categoryId) : undefined,
        categoryName:
          categoryNameById.get(String(product.categoryId ?? '')) ?? product.categoryName,
        imageUrl: product.imageUrl ?? undefined,
        lineTotal: product.price * quantity,
        name: product.name,
        productId,
        quantity,
        sku: product.sku,
        subcategory: product.subcategory,
        unitPrice: product.price
      };
    });
    const categoryIds = [
      ...new Set(products.map((product) => String(product.categoryId ?? '')).filter(Boolean))
    ];
    const subcategories = [
      ...new Set(products.map((product) => String(product.subcategory ?? '')).filter(Boolean))
    ];

    if (isWalletPayment) {
      const wallet = await CustomerWalletModel.findOneAndUpdate(
        {
          tenantId,
          userId,
          $expr: {
            $gte: [{ $subtract: ['$balance', '$reservedBalance'] }, quote.totalAmount]
          }
        },
        {
          $inc: { balance: -quote.totalAmount },
          $push: {
            transactions: {
              amount: quote.totalAmount,
              createdAt: new Date(),
              description: `Payment for order ${orderNumber}`,
              direction: 'debit',
              kind: 'wallet-payment',
              referenceId: orderNumber
            }
          }
        },
        { new: true }
      ).lean();

      if (!wallet) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Insufficient wallet balance. Select cash on delivery to continue.'
        );
      }
    }

    try {
      return await new OrderRepository(tenantId).create({
        ...payload,
        customerEmail: user.email,
        customerName,
        customerPhone: user.phone ?? payload.customerPhone,
        currency: 'MMK',
        categoryIds,
        deliveryFee: quote.deliveryFee,
        itemCount,
        itemsCount: itemCount,
        lineItems,
        orderNumber,
        paymentStatus: isWalletPayment ? 'paid' : 'pending',
        productIds: requestedProductIds,
        placedAt: new Date(),
        status: 'pending',
        subtotalAmount: payload.subtotalAmount,
        subcategories,
        tenantId,
        totalAmount: quote.totalAmount,
        userId
      });
    } catch (error) {
      if (isWalletPayment) {
        await CustomerWalletModel.updateOne(
          { tenantId, userId },
          {
            $inc: { balance: quote.totalAmount },
            $pull: {
              transactions: {
                kind: 'wallet-payment',
                referenceId: orderNumber
              }
            }
          }
        );
      }

      throw error;
    }
  }
}
