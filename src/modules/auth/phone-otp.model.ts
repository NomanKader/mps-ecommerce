import { Schema } from 'mongoose';

import { baseSchemaOptions } from '@core/database/base.schema';

export interface PhoneOtp {
  _id: string;
  tenantId: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const phoneOtpSchema = new Schema<PhoneOtp>(
  {
    tenantId: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date }
  },
  baseSchemaOptions
);

phoneOtpSchema.index({ tenantId: 1, phone: 1, createdAt: -1 });
