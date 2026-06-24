import { Types } from 'mongoose';

import { HTTP_STATUS } from '@core/response/http-status';
import { getTenantModels } from '@core/database/tenant-database';
import { User } from '@modules/users/user.types';
import { CustomerWallet, WalletTopUpRequest } from '@modules/wallets/wallet.types';
import { S3Service } from '@shared/services/s3.service';
import { ApiError } from '@utils/ApiError';

const paymentTransferDetails = {
  accountName: "AV's Store",
  accountNumber: '+95 8877594332',
  instructions: 'Transfer by KBZPay, WavePay, AYA Pay, CB Pay, bank transfer, or any Myanmar payment method. Upload the payment receipt after transfer.',
  provider: 'Myanmar mobile wallet / bank transfer',
};

const normalizeAmount = (value: unknown): number => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount / 100) * 100;
};

const serializeId = <T extends { _id: string }>(document: T) => ({
  ...document,
  id: String(document._id),
});

export class WalletService {
  constructor(private readonly imageStorageService = new S3Service()) {}

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
    body: Record<string, unknown>,
    receipt?: Express.Multer.File
  ) {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');
    if (!receipt) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Payment receipt image is required');

    const amount = normalizeAmount(body.amount);
    if (amount < 100) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Top-up amount must be at least 100 MMK');

    const user = await this.findTenantUser(tenantId, userId);
    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const receiptMetadata = await this.imageStorageService.uploadWalletReceipt(receipt, tenantId, userId);
    const { WalletTopUpRequestModel } = getTenantModels(tenantId);

    const request = await WalletTopUpRequestModel.create({
      amount,
      customerEmail: user.email,
      customerName,
      customerPhone: user.phone,
      paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod.trim() : undefined,
      promoCode: typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : undefined,
      ...receiptMetadata,
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

  private async withReceiptUrl<T extends WalletTopUpRequest & { id: string }>(request: T) {
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
}
