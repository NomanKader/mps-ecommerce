import { Types } from 'mongoose';

import { env } from '@config/env';
import { HTTP_STATUS } from '@core/response/http-status';
import { getTenantModels } from '@core/database/tenant-database';
import { MoPaymentsService } from '@modules/payments/mopayments.service';
import { User } from '@modules/users/user.types';
import { CustomerWallet, WalletTopUpRequest } from '@modules/wallets/wallet.types';
import { S3Service } from '@shared/services/s3.service';
import { ApiError } from '@utils/ApiError';

const paymentTransferDetails = {
  accountName: "AV's Store",
  accountNumber: '+95-9953055682',
  instructions: 'Top up your wallet securely online. Your wallet balance will update automatically after payment is confirmed.',
  provider: 'MoPayments online payment',
};

const normalizeAmount = (value: unknown): number => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount / 100) * 100;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeId = <T extends { _id: string }>(document: T) => ({
  ...document,
  id: String(document._id),
});

export class WalletService {
  constructor(
    private readonly imageStorageService = new S3Service(),
    private readonly moPaymentsService = new MoPaymentsService()
  ) {}

  async getCustomerWallet(tenantId: string | undefined, userId: string | undefined) {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');
    const wallet = await this.ensureWallet(tenantId, userId);
    const pendingRequests = await this.listCustomerTopUps(tenantId, userId);

    return {
      paymentTransferDetails,
      pendingTopUpCount: pendingRequests.filter((request) => request.status === 'pending').length,
      pendingTopUpTotal: pendingRequests
        .filter((request) => request.status === 'pending')
        .reduce((sum, request) => sum + request.amount, 0),
      recentTopUps: pendingRequests.slice(0, 5),
      wallet: serializeId(wallet),
    };
  }

  async createTopUpRequest(
    tenantId: string | undefined,
    userId: string | undefined,
    body: Record<string, unknown>
  ) {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');

    const amount = normalizeAmount(body.amount);
    if (amount < 100) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Top-up amount must be at least 100 MMK');
    if (!this.moPaymentsService.isConfigured()) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'MoPayments is not configured. Add merchant id and secret key before using online wallet top-up.'
      );
    }

    const user = await this.findTenantUser(tenantId, userId);
    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);
    const requestId = String(new Types.ObjectId());
    const merchantReferenceId = `WTU-${requestId}`;
    const publicApiBaseUrl = this.publicApiBaseUrl();
    const publicAppBaseUrl = this.publicAppBaseUrl();

    const moPaymentsToken = await this.moPaymentsService.requestPaymentToken({
      backendUrl: `${publicApiBaseUrl}/payments/mopayments/callback?tenantId=${encodeURIComponent(
        tenantId
      )}`,
      discountAmount: 0,
      frontendUrl: `${publicApiBaseUrl}/payments/mopayments/return?tenantId=${encodeURIComponent(
        tenantId
      )}&walletTopUpId=${encodeURIComponent(requestId)}&redirect=${encodeURIComponent(
        `${publicAppBaseUrl}/payment/mopayments/return`
      )}`,
      merchantReferenceId,
      paymentItems: [
        {
          name: 'Wallet top-up',
          price: amount,
          quantity: 1,
          total: amount
        }
      ],
      preferredGateways: this.moPaymentsService.getPreferredGateways(),
      subTotal: amount,
      taxAmount: 0,
      total: amount
    });

    const request = await WalletTopUpRequestModel.create({
      _id: requestId,
      amount,
      customerEmail: user.email,
      customerName,
      customerPhone: user.phone,
      paymentGateway: 'mopayments',
      paymentGatewayStatus: 'PROCESSING',
      paymentMerchantReferenceId: merchantReferenceId,
      paymentMethod: 'mopayments',
      paymentRedirectUrl: moPaymentsToken.paymentUrl,
      paymentToken: moPaymentsToken.token,
      paymentTokenExpiresAt: new Date(moPaymentsToken.expireAt),
      promoCode: typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : undefined,
      status: 'pending',
      tenantId,
      userId
    });

    return this.withReceiptUrl(serializeId(request.toObject() as WalletTopUpRequest));
  }

  async listCustomerTopUps(tenantId: string, userId: string) {
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);
    const requests = await WalletTopUpRequestModel.find({ tenantId, userId })
      .sort({ createdAt: -1 })
      .lean<WalletTopUpRequest[]>();
    return Promise.all(requests.map((request) => this.withReceiptUrl(serializeId(request))));
  }

  async listAdminTopUps(tenantId: string | undefined, query: Record<string, unknown> = {}) {
    if (!tenantId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant context is required');
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);
    const filter: Record<string, unknown> = { tenantId };
    if (query.status && ['pending', 'approved', 'rejected'].includes(String(query.status))) {
      filter.status = String(query.status);
    }

    const requests = await WalletTopUpRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .lean<WalletTopUpRequest[]>();

    return Promise.all(requests.map((request) => this.withReceiptUrl(serializeId(request))));
  }

  async approveTopUp(
    tenantId: string | undefined,
    adminId: string | undefined,
    id: string,
    body: Record<string, unknown>
  ) {
    if (!tenantId || !adminId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant admin context is required');
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);
    const request = await WalletTopUpRequestModel.findOne({ _id: id, tenantId }).lean<WalletTopUpRequest>();
    if (!request) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Top-up request not found');
    if (request.status !== 'pending') throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only pending requests can be approved');

    const approvedAmount = normalizeAmount(body.approvedAmount ?? request.amount);
    if (approvedAmount < 100) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Approved amount must be at least 100 MMK');

    const wallet = await this.ensureWallet(tenantId, request.userId);
    const { CustomerWalletModel } = getTenantModels(tenantId);
    await CustomerWalletModel.updateOne(
      { _id: wallet._id },
      {
        $inc: { balance: approvedAmount },
        $push: {
          transactions: {
            amount: approvedAmount,
            createdAt: new Date(),
            description: `Approved wallet top-up ${String(request._id)}`,
            direction: 'credit',
            kind: 'top-up',
            referenceId: String(request._id)
          }
        }
      }
    );

    const updated = await WalletTopUpRequestModel.findOneAndUpdate(
      { _id: id, tenantId },
      {
        adminNote: typeof body.adminNote === 'string' ? body.adminNote.trim() : undefined,
        approvedAmount,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        status: 'approved'
      },
      { new: true }
    ).lean<WalletTopUpRequest>();

    if (!updated) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Top-up request not found');
    return this.withReceiptUrl(serializeId(updated));
  }

  async rejectTopUp(
    tenantId: string | undefined,
    adminId: string | undefined,
    id: string,
    body: Record<string, unknown>
  ) {
    if (!tenantId || !adminId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant admin context is required');
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);
    const request = await WalletTopUpRequestModel.findOne({ _id: id, tenantId }).lean<WalletTopUpRequest>();
    if (!request) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Top-up request not found');
    if (request.status !== 'pending') throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only pending requests can be rejected');

    const updated = await WalletTopUpRequestModel.findOneAndUpdate(
      { _id: id, tenantId },
      {
        adminNote: typeof body.adminNote === 'string' ? body.adminNote.trim() : undefined,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        status: 'rejected'
      },
      { new: true }
    ).lean<WalletTopUpRequest>();

    if (!updated) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Top-up request not found');
    return this.withReceiptUrl(serializeId(updated));
  }

  async adminLoadWallet(
    tenantId: string | undefined,
    adminId: string | undefined,
    body: Record<string, unknown>
  ) {
    if (!tenantId || !adminId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant admin context is required');

    const amount = Number(body.amount);
    if (!Number.isSafeInteger(amount) || amount < 100) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Wallet load amount must be a whole number of at least 100 MMK');

    const customerEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() : '';
    const { CustomerWalletModel, UserModel } = getTenantModels(tenantId);
    const user = await UserModel.findOne({
      email: new RegExp(`^${escapeRegex(customerEmail)}$`, 'i'),
      tenantId,
      isDeleted: { $ne: true },
      isActive: true
    }).lean<User>();

    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Customer account not found for this email');

    const wallet = await this.ensureWallet(tenantId, String(user._id));
    const referenceId = `cash-${new Types.ObjectId().toString()}`;
    const description = adminNote ? `Cash wallet load: ${adminNote}` : 'Cash wallet load by admin';

    const updatedWallet = await CustomerWalletModel.findOneAndUpdate(
      { _id: wallet._id, tenantId },
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            amount,
            createdAt: new Date(),
            description,
            direction: 'credit',
            kind: 'admin-adjustment',
            performedBy: adminId,
            referenceId
          }
        }
      },
      { new: true }
    ).lean<CustomerWallet>();

    if (!updatedWallet) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Customer wallet not found');

    return {
      amount,
      balance: updatedWallet.balance,
      customerEmail: user.email,
      customerName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      referenceId,
      walletId: String(updatedWallet._id)
    };
  }

  private async withReceiptUrl<T extends WalletTopUpRequest & { id: string }>(request: T) {
    if (!request.receiptImageKey || !request.receiptImageName) {
      return { ...request, receiptImageUrl: null };
    }

    return {
      ...request,
      receiptImageUrl: await this.imageStorageService.getWalletReceiptUrl(
        request.receiptImageKey,
        request.receiptImageName
      )
    };
  }

  private async ensureWallet(tenantId: string, userId: string): Promise<CustomerWallet> {
    const { CustomerWalletModel } = getTenantModels(tenantId);
    const existing = await CustomerWalletModel.findOne({ tenantId, userId }).lean<CustomerWallet>();
    if (existing) return existing;

    const created = await CustomerWalletModel.create({
      balance: 0,
      reservedBalance: 0,
      tenantId,
      transactions: [],
      userId
    });
    return created.toObject() as CustomerWallet;
  }

  private async findTenantUser(tenantId: string, userId: string): Promise<User> {
    const { UserModel } = getTenantModels(tenantId);
    const user = await UserModel.findOne({
      _id: Types.ObjectId.isValid(userId) ? userId : userId,
      tenantId,
      isDeleted: { $ne: true },
      isActive: true
    }).lean<User>();

    if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User session is no longer active');
    return user;
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
