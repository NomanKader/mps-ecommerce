export type WalletTransactionKind = 'top-up' | 'admin-adjustment' | 'wallet-payment';

export interface WalletTransaction {
  amount: number;
  createdAt: Date;
  description: string;
  direction: 'credit' | 'debit';
  kind: WalletTransactionKind;
  referenceId?: string;
}

export interface CustomerWallet {
  _id: string;
  tenantId: string;
  userId: string;
  balance: number;
  reservedBalance: number;
  transactions: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export type WalletTopUpStatus = 'pending' | 'approved' | 'rejected';

export interface WalletTopUpRequest {
  _id: string;
  tenantId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  promoCode?: string;
  paymentMethod?: string;
  receiptImageName: string;
  receiptImageMimeType: string;
  receiptImageSize: number;
  receiptImageKey: string;
  receiptImageUrl?: string | null;
  status: WalletTopUpStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedAmount?: number;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
