import type { WalletSummary, WalletTopUpRequest } from '@entities/wallet/types/wallet.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type TopUpPayload = {
  amount: number;
  paymentMethod?: string;
  promoCode?: string;
  receipt: File;
};

const topUpFormData = (payload: TopUpPayload) => {
  const formData = new FormData();
  formData.append('amount', String(payload.amount));
  formData.append('receipt', payload.receipt);

  if (payload.paymentMethod) {
    formData.append('paymentMethod', payload.paymentMethod);
  }

  if (payload.promoCode) {
    formData.append('promoCode', payload.promoCode);
  }

  return formData;
};

export const walletApi = {
  async getSummary(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<WalletSummary>>(endpoints.wallet.summary, {
      signal: options.signal,
    });
    return response.data.data;
  },
  async submitTopUp(payload: TopUpPayload) {
    const response = await apiClient.post<ApiResponse<WalletTopUpRequest>>(
      endpoints.wallet.topUps,
      topUpFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
