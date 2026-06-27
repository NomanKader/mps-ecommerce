export type WalletTransactionKind =
  | 'bonus'
  | 'friend-credit'
  | 'top-up'
  | 'transfer'
  | 'admin-adjustment'
  | 'wallet-payment';

export type WalletTransactionDirection = 'credit' | 'debit';

export type WalletTransaction = {
  amount: number;
  createdAt: string;
  description: string;
  direction: WalletTransactionDirection;
  id: string;
  kind: WalletTransactionKind;
  status: 'completed';
};

export type Wallet = {
  balance: number;
  reservedBalance: number;
  transactions: WalletTransaction[];
  updatedAt: string;
  userKey: string;
};

export type WalletTopUpStatus = 'pending' | 'approved' | 'rejected';

export type WalletTopUpRequest = {
  adminNote?: string;
  amount: number;
  approvedAmount?: number;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  id: string;
  paymentMethod?: string;
  promoCode?: string;
  receiptImageKey: string;
  receiptImageMimeType: string;
  receiptImageName: string;
  receiptImageSize: number;
  receiptImageUrl?: string | null;
  reviewedAt?: string;
  status: WalletTopUpStatus;
  updatedAt: string;
  userId: string;
};

export type WalletPaymentTransferDetails = {
  accountName: string;
  accountNumber: string;
  instructions: string;
  provider: string;
};

export type ServerWallet = {
  balance: number;
  id: string;
  reservedBalance: number;
  transactions: WalletTransaction[];
  updatedAt: string;
  userId: string;
};

export type WalletSummary = {
  paymentTransferDetails: WalletPaymentTransferDetails;
  pendingTopUpCount: number;
  pendingTopUpTotal: number;
  recentTopUps: WalletTopUpRequest[];
  wallet: ServerWallet;
};
