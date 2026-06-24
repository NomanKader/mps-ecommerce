export type AddressLabel = 'home' | 'work' | 'other';

export interface Address {
  _id: string;
  tenantId: string;
  userId: string;
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
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
