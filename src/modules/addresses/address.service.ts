import { BaseService } from '@core/base/BaseService';
import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { Address } from '@modules/addresses/address.types';
import { ApiError } from '@utils/ApiError';

type AddressPayload = Partial<Address>;

export class AddressService extends BaseService {
  async listAddresses(tenantId?: string, userId?: string): Promise<Address[]> {
    if (!tenantId || !userId) return [];
    const { AddressModel } = getTenantModels(tenantId);

    return AddressModel.find({ tenantId, userId, isDeleted: { $ne: true } })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean<Address[]>();
  }

  async createAddress(
    tenantId: string | undefined,
    userId: string | undefined,
    payload: AddressPayload
  ): Promise<Address> {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');

    const { AddressModel } = getTenantModels(tenantId);
    const existingCount = await AddressModel.countDocuments({ tenantId, userId, isDeleted: { $ne: true } });
    const shouldSetDefault = payload.isDefault || existingCount === 0;

    if (shouldSetDefault) {
      await AddressModel.updateMany({ tenantId, userId }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.create({
      ...payload,
      isDefault: shouldSetDefault,
      tenantId,
      userId
    });

    return address.toObject() as Address;
  }

  async updateAddress(
    tenantId: string | undefined,
    userId: string | undefined,
    id: string,
    payload: AddressPayload
  ): Promise<Address> {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');

    const { AddressModel } = getTenantModels(tenantId);
    const filter = { _id: id, tenantId, userId, isDeleted: { $ne: true } };
    const existing = await AddressModel.findOne(filter).lean<Address>();
    if (!existing) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Address not found');

    if (payload.isDefault) {
      await AddressModel.updateMany({ tenantId, userId }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.findOneAndUpdate(filter, payload, {
      new: true,
      runValidators: true
    }).lean<Address>();
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Address not found');

    return address;
  }

  async deleteAddress(tenantId: string | undefined, userId: string | undefined, id: string): Promise<{ id: string }> {
    if (!tenantId || !userId) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');

    const { AddressModel } = getTenantModels(tenantId);
    const address = await AddressModel.findOne({ _id: id, tenantId, userId, isDeleted: { $ne: true } }).lean<Address>();
    if (!address) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Address not found');

    await AddressModel.updateOne({ _id: id, tenantId, userId }, { $set: { isDeleted: true, isDefault: false } });

    if (address.isDefault) {
      const nextDefault = await AddressModel.findOne({ tenantId, userId, isDeleted: { $ne: true } }).sort({ updatedAt: -1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    return { id };
  }
}
