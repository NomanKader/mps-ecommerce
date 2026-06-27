import { Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type {
  CustomerAddress,
  CustomerAddressPayload,
} from '@entities/address/types/address.types';
import { useAddresses } from '@features/addresses/hooks/useAddresses';
import { useCart } from '@features/cart/hooks/useCart';
import { useMyanmarLocations } from '@features/locations/hooks/useMyanmarLocations';
import { checkoutDraftStorage } from '@features/order/utils/checkoutDraft';
import { routePaths } from '@routes/routePaths';
import { toApiError } from '@shared/api/apiError';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import type { RootState } from '@store/index';
import { CheckoutSections, type CheckoutForm } from '@widgets/CheckoutSections/CheckoutSections';

const getUserName = (user: RootState['auth']['user']) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : '';

const getEmptyCheckoutForm = (user: RootState['auth']['user']): CheckoutForm => ({
  addressLine1: '',
  addressLine2: '',
  city: '',
  deliveryInstructions: '',
  email: user?.email ?? '',
  fullName: getUserName(user),
  isDefault: false,
  label: 'home',
  landmark: '',
  phone: user?.phone ?? '',
  region: '',
  township: '',
});

const addressToForm = (
  address: CustomerAddress,
  user: RootState['auth']['user'],
): CheckoutForm => ({
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2 ?? '',
  city: address.city,
  deliveryInstructions: address.deliveryInstructions ?? '',
  email: user?.email ?? '',
  fullName: address.recipientName || getUserName(user),
  isDefault: address.isDefault,
  label: address.label,
  landmark: address.landmark ?? '',
  phone: address.phone || user?.phone || '',
  region: address.region,
  township: address.township,
});

const formToAddressPayload = (form: CheckoutForm): CustomerAddressPayload => ({
  addressLine1: form.addressLine1.trim(),
  addressLine2: form.addressLine2.trim() || undefined,
  city: form.city.trim(),
  deliveryInstructions: form.deliveryInstructions.trim() || undefined,
  isDefault: form.isDefault,
  label: form.label,
  landmark: form.landmark.trim() || undefined,
  phone: form.phone.trim(),
  recipientName: form.fullName.trim(),
  region: form.region.trim(),
  township: form.township.trim(),
});

const formatDeliveryAddress = (form: CheckoutForm) =>
  [
    form.addressLine1,
    form.addressLine2,
    form.landmark,
    form.city,
    form.township,
    form.region,
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ');

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { addresses, createAddress, isLoading: isLoadingAddresses, isSaving } = useAddresses();
  const locationsQuery = useMyanmarLocations();
  const { items, totalItems, totalPrice } = useCart();
  const [form, setForm] = useState<CheckoutForm>(() => getEmptyCheckoutForm(user));
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const currency = items[0]?.product.currency ?? 'MMK';
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        email: current.email || user?.email || '',
        fullName: current.fullName || getUserName(user),
        phone: current.phone || user?.phone || '',
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!addresses.length || selectedAddressId) {
        if (!addresses.length) setIsAddingAddress(true);
        return;
      }

      const initialAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      if (!initialAddress) return;

      setSelectedAddressId(initialAddress.id);
      setForm(addressToForm(initialAddress, user));
      setIsAddingAddress(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [addresses, selectedAddressId, user]);

  const handleSelectAddress = (addressId: string) => {
    const address = addresses.find((item) => item.id === addressId);
    if (!address) return;

    setSelectedAddressId(address.id);
    setForm(addressToForm(address, user));
  };

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setForm(getEmptyCheckoutForm(user));
  };

  const handleCancelAddAddress = () => {
    const address =
      selectedAddress ?? addresses.find((item) => item.isDefault) ?? addresses[0];
    if (!address) return;

    setIsAddingAddress(false);
    setSelectedAddressId(address.id);
    setForm(addressToForm(address, user));
  };

  const handleSubmit = async () => {
    const requiredFields = [
      form.fullName,
      form.phone,
      form.addressLine1,
      form.city,
      form.township,
      form.region,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      toast.error('Complete all required customer and delivery address fields.');
      return;
    }

    try {
      let checkoutForm = form;

      if (isAddingAddress || !addresses.length) {
        const savedAddress = await createAddress(formToAddressPayload(form));
        setSelectedAddressId(savedAddress.id);
        setIsAddingAddress(false);
        checkoutForm = addressToForm(savedAddress, user);
        setForm(checkoutForm);
      }

      checkoutDraftStorage.set({
        city: checkoutForm.city.trim(),
        currency,
        customerEmail: checkoutForm.email.trim() || undefined,
        customerName: checkoutForm.fullName.trim(),
        customerPhone: checkoutForm.phone.trim(),
        deliveryAddress: formatDeliveryAddress(checkoutForm),
        itemCount: totalItems,
        region: checkoutForm.region.trim(),
        township: checkoutForm.township.trim(),
        subtotalAmount: totalPrice,
      });
      navigate(routePaths.payment);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <Stack spacing={4}>
      <PageSection
        description="Confirm your customer details and delivery address before placing the order."
        title="Checkout"
      >
        {items.length ? (
          <CheckoutSections
            addresses={addresses}
            currency={currency}
            form={form}
            isAddingAddress={isAddingAddress}
            isLoadingAddresses={isLoadingAddresses}
            isSubmitting={isSaving}
            locations={locationsQuery.data ?? []}
            onAddAddress={handleAddAddress}
            onCancelAddAddress={handleCancelAddAddress}
            onChange={(field, value) =>
              setForm((current) => ({ ...current, [field]: value }))
            }
            onSelectAddress={handleSelectAddress}
            onSubmit={() => void handleSubmit()}
            selectedAddressId={selectedAddressId}
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
