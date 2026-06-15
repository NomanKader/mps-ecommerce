import { model, Schema } from 'mongoose';

import { Role } from '@common/enums/role.enum';
import { addSoftDeleteFields, baseSchemaOptions } from '@core/database/base.schema';
import { User } from '@modules/users/user.types';

export const userSchema = new Schema<User>(
  {
    tenantId: { type: String, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, index: true },
    phoneVerifiedAt: { type: Date },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.CUSTOMER, index: true },
    isActive: { type: Boolean, default: true }
  },
  baseSchemaOptions
);

addSoftDeleteFields(userSchema);
userSchema.index({ tenantId: 1, email: 1 }, { unique: true, sparse: true });
userSchema.index({ tenantId: 1, phone: 1 }, { unique: true, sparse: true });

export const SystemUserModel = model<User>('SystemUser', userSchema, 'system_users');
