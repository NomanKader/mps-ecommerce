import { useCallback, useEffect, useMemo, useState } from 'react';

import type { User } from '@entities/user/types/user.types';
import type { Wallet, WalletTransaction, WalletTransactionKind } from '@entities/wallet/types/wallet.types';
import { storageService } from '@services/storage/storage.service';

const WALLETS_STORAGE_KEY = 'mps.wallets.v1';

type StoredWallets = Record<string, Wallet>;

const now = () => new Date().toISOString();

const createTransaction = (
  kind: WalletTransactionKind,
  amount: number,
  description: string,
  direction: WalletTransaction['direction'],
): WalletTransaction => ({
  amount,
  createdAt: now(),
  description,
  direction,
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  kind,
  status: 'completed',
});

const createEmptyWallet = (userKey: string): Wallet => ({
  balance: 0,
  reservedBalance: 0,
  transactions: [],
  updatedAt: now(),
  userKey,
});

const getStoredWallets = (): StoredWallets => storageService.get<StoredWallets>(WALLETS_STORAGE_KEY) ?? {};

const setStoredWallets = (wallets: StoredWallets) => {
  storageService.set(WALLETS_STORAGE_KEY, wallets);
};

const getUserWalletKey = (user: User | null) => {
  if (user?.email) {
    return user.email.trim().toLowerCase();
  }

  if (user?.id) {
    return user.id;
  }

  return 'guest';
};

const getEmailWalletKey = (email: string) => email.trim().toLowerCase();

const normalizeAmount = (amount: number) => Math.round(amount * 100) / 100;

export const useWallet = (user: User | null) => {
  const userKey = useMemo(() => getUserWalletKey(user), [user]);
  const [wallet, setWallet] = useState<Wallet>(() => getStoredWallets()[userKey] ?? createEmptyWallet(userKey));

  useEffect(() => {
    const wallets = getStoredWallets();
    const userWallet = wallets[userKey] ?? createEmptyWallet(userKey);

    if (!wallets[userKey]) {
      setStoredWallets({ ...wallets, [userKey]: userWallet });
    }

    setWallet(userWallet);
  }, [userKey]);

  const persistWallets = useCallback(
    (update: (wallets: StoredWallets, currentWallet: Wallet) => StoredWallets) => {
      const wallets = getStoredWallets();
      const currentWallet = wallets[userKey] ?? createEmptyWallet(userKey);
      const nextWallets = update(wallets, currentWallet);

      setStoredWallets(nextWallets);
      setWallet(nextWallets[userKey] ?? createEmptyWallet(userKey));
    },
    [userKey],
  );

  const addFunds = useCallback(
    (amount: number, description = 'Wallet top-up') => {
      const normalizedAmount = normalizeAmount(amount);

      if (normalizedAmount <= 0) {
        return false;
      }

      persistWallets((wallets, currentWallet) => ({
        ...wallets,
        [userKey]: {
          ...currentWallet,
          balance: normalizeAmount(currentWallet.balance + normalizedAmount),
          transactions: [
            createTransaction('top-up', normalizedAmount, description, 'credit'),
            ...currentWallet.transactions,
          ],
          updatedAt: now(),
        },
      }));

      return true;
    },
    [persistWallets, userKey],
  );

  const addBonusFunds = useCallback(
    (amount: number, bonus: number) => {
      const normalizedAmount = normalizeAmount(amount);
      const normalizedBonus = normalizeAmount(bonus);

      if (normalizedAmount <= 0) {
        return false;
      }

      persistWallets((wallets, currentWallet) => {
        const transactions = [
          createTransaction('top-up', normalizedAmount, `Bulk wallet package ${normalizedAmount.toLocaleString()}`, 'credit'),
        ];

        if (normalizedBonus > 0) {
          transactions.push(createTransaction('bonus', normalizedBonus, 'Bulk buy bonus credit', 'credit'));
        }

        return {
          ...wallets,
          [userKey]: {
            ...currentWallet,
            balance: normalizeAmount(currentWallet.balance + normalizedAmount + normalizedBonus),
            transactions: [...transactions, ...currentWallet.transactions],
            updatedAt: now(),
          },
        };
      });

      return true;
    },
    [persistWallets, userKey],
  );

  const transferToFriend = useCallback(
    (email: string, amount: number) => {
      const friendKey = getEmailWalletKey(email);
      const normalizedAmount = normalizeAmount(amount);

      if (
        !friendKey ||
        friendKey === userKey ||
        normalizedAmount <= 0 ||
        normalizedAmount > normalizeAmount(wallet.balance - wallet.reservedBalance)
      ) {
        return false;
      }

      persistWallets((wallets, currentWallet) => {
        const friendWallet = wallets[friendKey] ?? createEmptyWallet(friendKey);

        return {
          ...wallets,
          [friendKey]: {
            ...friendWallet,
            balance: normalizeAmount(friendWallet.balance + normalizedAmount),
            transactions: [
              createTransaction('friend-credit', normalizedAmount, `Credit from ${user?.email ?? 'customer'}`, 'credit'),
              ...friendWallet.transactions,
            ],
            updatedAt: now(),
          },
          [userKey]: {
            ...currentWallet,
            balance: normalizeAmount(currentWallet.balance - normalizedAmount),
            transactions: [
              createTransaction('transfer', normalizedAmount, `Transfer to ${friendKey}`, 'debit'),
              ...currentWallet.transactions,
            ],
            updatedAt: now(),
          },
        };
      });

      return true;
    },
    [persistWallets, user?.email, userKey, wallet.balance],
  );

  return {
    addBonusFunds,
    addFunds,
    availableBalance: normalizeAmount(wallet.balance - wallet.reservedBalance),
    transferToFriend,
    wallet,
  };
};
