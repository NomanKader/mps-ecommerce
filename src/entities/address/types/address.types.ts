export type AddressLabel = 'home' | 'work' | 'other';

export type CustomerAddress = {
  id: string;
  label: AddressLabel;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  township: string;
  region: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
};

export type CustomerAddressPayload = Omit<CustomerAddress, 'id'>;
