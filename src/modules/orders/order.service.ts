import { BaseService } from '@core/base/BaseService';
import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order } from '@modules/orders/order.types';
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
  | 'region'
  | 'subtotalAmount'
  | 'township'
>;

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

    return new OrderRepository(tenantId).find({
      customerEmail: user.email.trim().toLowerCase(),
      tenantId,
      userId
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
    const { CustomerWalletModel, UserModel } = getTenantModels(tenantId);
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
        deliveryFee: quote.deliveryFee,
        itemCount,
        itemsCount: itemCount,
        orderNumber,
        paymentStatus: isWalletPayment ? 'paid' : 'pending',
        placedAt: new Date(),
        status: 'pending',
        subtotalAmount: payload.subtotalAmount,
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
