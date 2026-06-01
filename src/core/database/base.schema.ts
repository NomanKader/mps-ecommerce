import { Schema } from 'mongoose';

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false
} as const;

export const addSoftDeleteFields = <T>(schema: Schema<T>): void => {
  schema.add({
    isDeleted: { type: Boolean, default: false }
  } as never);
};
