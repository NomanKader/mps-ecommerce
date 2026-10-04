import type {
  WalletSummary,
  WalletTopUpPaymentResponse,
  WalletTopUpRequest,
} from '@entities/wallet/types/wallet.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type TopUpPayload = {
  amount: number;
  promoCode?: string;
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
      payload,
    );
    return response.data as WalletTopUpPaymentResponse;
  },
};
