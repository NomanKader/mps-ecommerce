import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';
import { CustomerWallet, WalletTopUpRequest } from '@modules/wallets/wallet.types';

const walletTransactionSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now, required: true },
    description: { type: String, required: true, trim: true },
    direction: { type: String, enum: ['credit', 'debit'], required: true },
    kind: {
      type: String,
      enum: ['top-up', 'admin-adjustment', 'wallet-payment'],
      required: true
    },
    referenceId: { type: String, trim: true },
    performedBy: { type: String, trim: true }
  },
  { _id: false, versionKey: false }
);

export const customerWalletSchema = new Schema<CustomerWallet>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    balance: { type: Number, default: 0, min: 0, required: true },
    reservedBalance: { type: Number, default: 0, min: 0, required: true },
    transactions: { type: [walletTransactionSchema], default: [] }
  },
  baseSchemaOptions
);

customerWalletSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export const walletTopUpRequestSchema = new Schema<WalletTopUpRequest>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    amount: { type: Number, required: true, min: 100 },
    promoCode: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    paymentGateway: { type: String, trim: true },
    paymentGatewayReferenceId: { type: String, trim: true },
    paymentGatewayStatus: { type: String, trim: true },
    paymentMerchantReferenceId: { type: String, index: true },
    paymentRedirectUrl: { type: String, trim: true },
    paymentSettlementAmount: { type: Number, min: 0 },
    paymentToken: { type: String, trim: true, index: true },
    paymentTokenExpiresAt: { type: Date },
    paymentTransactionAmount: { type: Number, min: 0 },
    receiptImageName: { type: String, trim: true },
    receiptImageMimeType: { type: String, trim: true },
    receiptImageSize: { type: Number, min: 1 },
    receiptImageKey: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true, index: true },
    reviewedBy: { type: String, trim: true },
    reviewedAt: { type: Date },
    approvedAmount: { type: Number, min: 0 },
    adminNote: { type: String, trim: true }
  },
  baseSchemaOptions
);

walletTopUpRequestSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
walletTopUpRequestSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
