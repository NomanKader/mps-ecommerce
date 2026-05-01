export type WalletTransactionKind = 'bonus' | 'friend-credit' | 'top-up' | 'transfer';

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
