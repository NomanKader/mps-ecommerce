import { Stack } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { useCart } from '@features/cart/hooks/useCart';
import { orderApi } from '@features/order/api/orderApi';
import { toApiError } from '@shared/api/apiError';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { CheckoutSections, type CheckoutForm } from '@widgets/CheckoutSections/CheckoutSections';

const emptyCheckoutForm: CheckoutForm = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  email: '',
  fullName: '',
  phone: '',
};

export const CheckoutPage = () => {
  const { clearCart, items, totalItems, totalPrice } = useCart();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyCheckoutForm);
  const currency = items[0]?.product.currency ?? 'USD';
  const createOrderMutation = useMutation({
    mutationFn: () =>
      orderApi.createOrder({
        customerEmail: form.email.trim() || undefined,
        customerName: form.fullName.trim(),
        customerPhone: form.phone.trim() || undefined,
        deliveryAddress: [form.addressLine1, form.addressLine2, form.city]
          .map((item) => item.trim())
          .filter(Boolean)
          .join(', '),
        itemCount: totalItems,
        region: form.city.trim() || undefined,
        totalAmount: totalPrice,
      }),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      setForm(emptyCheckoutForm);
      toast.success('Order placed successfully.');
    },
  });

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.addressLine1.trim()) {
      toast.error('Enter your name and delivery address.');
      return;
    }

    createOrderMutation.mutate();
  };

  return (
    <Stack spacing={4}>
      <PageSection
        description="Place orders through the live customer orders API."
        title="Checkout"
      >
        {items.length ? (
          <CheckoutSections
            currency={currency}
            form={form}
            isSubmitting={createOrderMutation.isPending}
            onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
            onSubmit={handleSubmit}
            totalAmount={totalPrice}
          />
        ) : (
          <EmptyState
            description="Add catalog items to your cart before placing an order. Checkout will be available as soon as your cart has items."
            title="Checkout items will be available soon"
          />
        )}
      </PageSection>
    </Stack>
  );
};
