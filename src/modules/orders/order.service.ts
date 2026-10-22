import { BaseService } from '@core/base/BaseService';
import { env } from '@config/env';
import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { Promotion } from '@modules/admin/admin.models';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order, OrderLineItem } from '@modules/orders/order.types';
import { MoPaymentsService } from '@modules/payments/mopayments.service';
import { EmailService } from '@shared/services/email.service';
import { ApiError } from '@utils/ApiError';
import { logger } from '@config/logger';

type CreateOrderInput = Pick<
  Order,
  | 'city'
  | 'customerEmail'
  | 'customerName'
  | 'customerPhone'
  | 'deliveryAddress'
  | 'itemCount'
  | 'paymentMethod'
  | 'promoCode'
  | 'productIds'
  | 'region'
  | 'subtotalAmount'
  | 'township'
> & {
  items: Array<{ productId: string; quantity: number; message?: string }>;
};

type DeliveryQuoteInput = {
  city: string;
  promoCode?: string;
  region: string;
  subtotalAmount: number;
  township: string;
};

const normalizePromoCode = (code: unknown) =>
  typeof code === 'string' ? code.trim().toUpperCase() : '';

const parsePromotionDiscount = (
  promotion: Promotion,
  subtotalAmount: number,
  deliveryFee: number
) => {
  const discountText = promotion.discount.trim();
  const normalizedDiscount = discountText.toLowerCase();
  const percentageMatch = normalizedDiscount.match(/(\d+(?:\.\d+)?)\s*%/);
  const amountMatch = normalizedDiscount.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(?:mmk|ks|kyat)?/);
  let discountAmount = 0;

  if (normalizedDiscount.includes('free') && normalizedDiscount.includes('delivery')) {
    discountAmount = deliveryFee;
  } else if (percentageMatch) {
    discountAmount = Math.floor((subtotalAmount * Number(percentageMatch[1])) / 100);
  } else if (amountMatch) {
    discountAmount = Number(amountMatch[1]);
  }

  discountAmount = Math.max(0, Math.min(Math.round(discountAmount), subtotalAmount + deliveryFee));

  return {
    promoCode: promotion.code,
    promoDiscountAmount: discountAmount,
    promoDiscountLabel: discountText,
    promotion
  };
};

export class OrderService extends BaseService {
  constructor(
    private readonly moPaymentsService = new MoPaymentsService(),
    private readonly emailService = new EmailService()
  ) {
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

    if (!['Yangon', 'Yangon Region'].includes(payload.region.trim())) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Delivery is available in Yangon only for now'
      );
    }

    const { DeliveryFeeModel } = getTenantModels(tenantId);
    const configuration = await DeliveryFeeModel.findOne({
      tenantId,
      // Checkout uses "Yangon" while the region master stores "Yangon Region".
      region: { $in: ['Yangon', 'Yangon Region'] },
      township: payload.township,
      status: 'active',
      isDeleted: { $ne: true }
    })
      .sort({ updatedAt: -1, _id: 1 })
      .lean();

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
    const promoCode = normalizePromoCode(payload.promoCode);
    const promotion = promoCode
      ? await this.findActivePromotionByCode(tenantId, promoCode)
      : undefined;
    const promoDiscount = promotion
      ? parsePromotionDiscount(promotion, payload.subtotalAmount, deliveryFee)
      : undefined;
    const promoDiscountAmount = promoDiscount?.promoDiscountAmount ?? 0;
    const totalBeforeDiscount = payload.subtotalAmount + deliveryFee;

    return {
      city: payload.city,
      deliveryFee,
      eta: configuration.eta,
      freeDeliveryApplied: deliveryFee === 0 && configuration.fee > 0,
      freeOver: configuration.freeOver,
      promoCode: promoDiscount?.promoCode,
      promoDiscountAmount,
      promoDiscountLabel: promoDiscount?.promoDiscountLabel,
      region: payload.region,
      subtotalAmount: payload.subtotalAmount,
      totalAmount: Math.max(0, totalBeforeDiscount - promoDiscountAmount),
      totalBeforeDiscount,
      township: payload.township
    };
  }

  async listActivePromotions(tenantId: string | undefined) {
    if (!tenantId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tenant context is required');
    }

    const now = new Date();
    const { PromotionModel } = getTenantModels(tenantId);
    return PromotionModel.find({
      tenantId,
      status: 'active',
      startsAt: { $lte: now },
      endsAt: { $gte: now },
      isDeleted: { $ne: true }
    })
      .sort({ startsAt: -1 })
      .select('_id campaign code discount endsAt startsAt status uses')
      .lean<Promotion[]>();
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
      promoCode: payload.promoCode,
      subtotalAmount: payload.subtotalAmount,
      township: payload.township
    });
    const itemCount = payload.itemCount;
    const orderNumber = `ORD-${Date.now()}`;
    const isWalletPayment = payload.paymentMethod === 'wallet';
    const isMoPaymentsPayment = payload.paymentMethod === 'mopayments';
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
    const requestedItems: CreateOrderInput['items'] = payload.items.length
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

    const lineItems: OrderLineItem[] = requestedItems.map(({ productId, quantity, message }) => {
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
        message: message?.trim() || undefined,
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

    let moPaymentsToken:
      | {
          expireAt: number;
          paymentUrl: string;
          token: string;
        }
      | undefined;

    if (isMoPaymentsPayment) {
      if (!this.moPaymentsService.isConfigured()) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'MoPayments is not configured. Add merchant id and secret key before using online payment.'
        );
      }

      const publicApiBaseUrl = this.publicApiBaseUrl();
      const publicAppBaseUrl = this.publicAppBaseUrl();

      const paymentItems = lineItems.map((item) => ({
        name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        total: item.lineTotal
      }));

      if (quote.deliveryFee > 0) {
        paymentItems.push({
          name: 'Delivery fee',
          price: quote.deliveryFee,
          quantity: 1,
          total: quote.deliveryFee
        });
      }

      moPaymentsToken = await this.moPaymentsService.requestPaymentToken({
        backendUrl: `${publicApiBaseUrl}/payments/mopayments/callback?tenantId=${encodeURIComponent(
          tenantId
        )}`,
        discountAmount: quote.promoDiscountAmount ?? 0,
        frontendUrl: `${publicApiBaseUrl}/payments/mopayments/return?tenantId=${encodeURIComponent(
          tenantId
        )}&orderNumber=${encodeURIComponent(orderNumber)}&redirect=${encodeURIComponent(
          `${publicAppBaseUrl}/payment/mopayments/return`
        )}`,
        merchantReferenceId: orderNumber,
        paymentItems,
        preferredGateways: this.moPaymentsService.getPreferredGateways(),
        subTotal: quote.totalBeforeDiscount,
        taxAmount: 0,
        total: quote.totalAmount
      });
    }

    try {
      const order = await new OrderRepository(tenantId).create({
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
        paymentGateway: isMoPaymentsPayment ? 'mopayments' : undefined,
        paymentGatewayStatus: isMoPaymentsPayment ? 'PROCESSING' : undefined,
        paymentRedirectUrl: moPaymentsToken?.paymentUrl,
        paymentToken: moPaymentsToken?.token,
        paymentTokenExpiresAt: moPaymentsToken ? new Date(moPaymentsToken.expireAt) : undefined,
        productIds: requestedProductIds,
        promoCode: quote.promoCode,
        promoDiscountAmount: quote.promoDiscountAmount,
        promoDiscountLabel: quote.promoDiscountLabel,
        placedAt: new Date(),
        status: 'pending',
        subtotalAmount: payload.subtotalAmount,
        subcategories,
        tenantId,
        totalAmount: quote.totalAmount,
        userId
      });

      if (quote.promoCode) {
        const { PromotionModel } = getTenantModels(tenantId);
        await PromotionModel.updateOne(
          { tenantId, code: quote.promoCode, isDeleted: { $ne: true } },
          { $inc: { uses: 1 } }
        );
      }

      await this.notifyAdminNewOrder(order).catch((error: unknown) => {
        logger.error('Failed to send new order notification email', {
          error,
          orderNumber: order.orderNumber
        });
      });
      await this.notifyCustomerOrderCreated(order).catch((error: unknown) => {
        logger.error('Failed to send customer order confirmation email', {
          error,
          orderNumber: order.orderNumber
        });
      });

      return order;
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

  private async notifyAdminNewOrder(order: Order) {
    const itemLines = order.lineItems.map(
      (item) =>
        `${item.quantity} x ${item.name} (${item.sku}) - ${this.formatAmount(item.lineTotal)}`
    );
    const discountLine = order.promoDiscountAmount
      ? `Promo: ${order.promoCode ?? ''} ${order.promoDiscountLabel ?? ''} (-${this.formatAmount(
          order.promoDiscountAmount
        )})`
      : undefined;
    const text = [
      `New order placed: ${order.orderNumber}`,
      '',
      `Customer: ${order.customerName}`,
      `Email: ${order.customerEmail ?? 'N/A'}`,
      `Phone: ${order.customerPhone ?? 'N/A'}`,
      `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
      `Delivery: ${order.deliveryAddress ?? 'N/A'}`,
      `Township/Region: ${[order.township, order.region].filter(Boolean).join(', ') || 'N/A'}`,
      '',
      'Items:',
      ...itemLines,
      '',
      `Subtotal: ${this.formatAmount(order.subtotalAmount)}`,
      `Delivery fee: ${this.formatAmount(order.deliveryFee)}`,
      discountLine,
      `Total: ${this.formatAmount(order.totalAmount)}`
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
    const html = `
      <h2>New order placed: ${order.orderNumber}</h2>
      <p><strong>Customer:</strong> ${this.escapeHtml(order.customerName)}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(order.customerEmail ?? 'N/A')}</p>
      <p><strong>Phone:</strong> ${this.escapeHtml(order.customerPhone ?? 'N/A')}</p>
      <p><strong>Payment:</strong> ${this.escapeHtml(order.paymentMethod)} (${this.escapeHtml(order.paymentStatus)})</p>
      <p><strong>Delivery:</strong> ${this.escapeHtml(order.deliveryAddress ?? 'N/A')}</p>
      <p><strong>Township/Region:</strong> ${this.escapeHtml(
        [order.township, order.region].filter(Boolean).join(', ') || 'N/A'
      )}</p>
      <h3>Items</h3>
      <ul>
        ${order.lineItems
          .map(
            (item) =>
              `<li>${item.quantity} x ${this.escapeHtml(item.name)} (${this.escapeHtml(
                item.sku
              )}) - ${this.formatAmount(item.lineTotal)}</li>`
          )
          .join('')}
      </ul>
      <p><strong>Subtotal:</strong> ${this.formatAmount(order.subtotalAmount)}</p>
      <p><strong>Delivery fee:</strong> ${this.formatAmount(order.deliveryFee)}</p>
      ${
        order.promoDiscountAmount
          ? `<p><strong>Promo:</strong> ${this.escapeHtml(order.promoCode ?? '')} ${this.escapeHtml(
              order.promoDiscountLabel ?? ''
            )} (-${this.formatAmount(order.promoDiscountAmount)})</p>`
          : ''
      }
      <p><strong>Total:</strong> ${this.formatAmount(order.totalAmount)}</p>
    `;

    await this.emailService.sendMail({
      html,
      subject: `New order ${order.orderNumber} - ${this.formatAmount(order.totalAmount)}`,
      text,
      to: env.ORDER_NOTIFICATION_EMAIL
    });
  }

  private async notifyCustomerOrderCreated(order: Order) {
    if (!order.customerEmail) return;

    const paymentMessage =
      order.paymentMethod === 'cash_on_delivery'
        ? 'Your order is confirmed for cash on delivery.'
        : order.paymentMethod === 'wallet'
          ? 'Your order is confirmed and paid by wallet.'
          : 'Your order is received. We will confirm it after online payment is completed.';
    const itemLines = order.lineItems.map(
      (item) =>
        `${item.quantity} x ${item.name} (${item.sku}) - ${this.formatAmount(item.lineTotal)}`
    );
    const discountLine = order.promoDiscountAmount
      ? `Promo: ${order.promoCode ?? ''} ${order.promoDiscountLabel ?? ''} (-${this.formatAmount(
          order.promoDiscountAmount
        )})`
      : undefined;
    const text = [
      `Thank you for your order, ${order.customerName}.`,
      paymentMessage,
      '',
      `Order number: ${order.orderNumber}`,
      `Delivery address: ${order.deliveryAddress ?? 'N/A'}`,
      '',
      'Items:',
      ...itemLines,
      '',
      `Subtotal: ${this.formatAmount(order.subtotalAmount)}`,
      `Delivery fee: ${this.formatAmount(order.deliveryFee)}`,
      discountLine,
      `Total: ${this.formatAmount(order.totalAmount)}`
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
    const html = `
      <h2>Thank you for your order</h2>
      <p>Hi ${this.escapeHtml(order.customerName)},</p>
      <p>${this.escapeHtml(paymentMessage)}</p>
      <p><strong>Order number:</strong> ${this.escapeHtml(order.orderNumber)}</p>
      <p><strong>Delivery address:</strong> ${this.escapeHtml(order.deliveryAddress ?? 'N/A')}</p>
      <h3>Items</h3>
      <ul>
        ${order.lineItems
          .map(
            (item) =>
              `<li>${item.quantity} x ${this.escapeHtml(item.name)} (${this.escapeHtml(
                item.sku
              )}) - ${this.formatAmount(item.lineTotal)}</li>`
          )
          .join('')}
      </ul>
      <p><strong>Subtotal:</strong> ${this.formatAmount(order.subtotalAmount)}</p>
      <p><strong>Delivery fee:</strong> ${this.formatAmount(order.deliveryFee)}</p>
      ${
        order.promoDiscountAmount
          ? `<p><strong>Promo:</strong> ${this.escapeHtml(order.promoCode ?? '')} ${this.escapeHtml(
              order.promoDiscountLabel ?? ''
            )} (-${this.formatAmount(order.promoDiscountAmount)})</p>`
          : ''
      }
      <p><strong>Total:</strong> ${this.formatAmount(order.totalAmount)}</p>
    `;

    await this.emailService.sendMail({
      html,
      subject: `Your AV's Store order ${order.orderNumber}`,
      text,
      to: order.customerEmail
    });
  }

  private formatAmount(amount: number) {
    return `${Math.round(amount).toLocaleString('en-US')} MMK`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async findActivePromotionByCode(tenantId: string, promoCode: string): Promise<Promotion> {
    const now = new Date();
    const { PromotionModel } = getTenantModels(tenantId);
    const promotion = await PromotionModel.findOne({
      tenantId,
      code: promoCode,
      status: 'active',
      startsAt: { $lte: now },
      endsAt: { $gte: now },
      isDeleted: { $ne: true }
    }).lean<Promotion>();

    if (!promotion) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Promo code is not active or does not exist');
    }

    return promotion;
  }

  private publicApiBaseUrl(): string {
    const configured = env.PUBLIC_API_BASE_URL?.replace(/\/$/, '');

    if (!configured) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'PUBLIC_API_BASE_URL is required for MoPayments callback URLs'
      );
    }

    return configured.endsWith(env.API_PREFIX) ? configured : `${configured}${env.API_PREFIX}`;
  }

  private publicAppBaseUrl(): string {
    const configured = env.PUBLIC_APP_BASE_URL?.replace(/\/$/, '');

    if (!configured) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'PUBLIC_APP_BASE_URL is required for MoPayments return URLs'
      );
    }

    return configured;
  }
}
