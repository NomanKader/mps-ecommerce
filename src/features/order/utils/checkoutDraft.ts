import type { CreateOrderPayload } from '@features/order/api/orderApi';

const CHECKOUT_DRAFT_KEY = 'mps.checkout-draft.v2';

export type CheckoutDraft = Omit<CreateOrderPayload, 'items' | 'paymentMethod' | 'productIds'> & {
  currency: string;
};

export const checkoutDraftStorage = {
  clear() {
    window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
  },
  get(): CheckoutDraft | null {
    const value = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);

    if (!value) return null;

    try {
      return JSON.parse(value) as CheckoutDraft;
    } catch {
      window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return null;
    }
  },
  set(draft: CheckoutDraft) {
    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  },
};
