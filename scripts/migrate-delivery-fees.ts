import mongoose from 'mongoose';

import { connectDatabase } from '@config/database';
import { getTenantModels } from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';

const MIN_DELIVERY_FEE = 4500;
const MAX_DELIVERY_FEE = 20000;

const normalizeLegacyAmount = (value: unknown): number => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return amount > MAX_DELIVERY_FEE ? Math.round(amount / 10) : Math.round(amount);
};

const normalizeFee = (value: unknown): number =>
  Math.min(MAX_DELIVERY_FEE, Math.max(MIN_DELIVERY_FEE, normalizeLegacyAmount(value)));

const run = async (): Promise<void> => {
  await connectDatabase();

  const tenants = await TenantModel.find({ isDeleted: { $ne: true } }).lean();
  let updatedFees = 0;

  for (const tenant of tenants) {
    const tenantKey = tenant.slug || tenant.tenantId;
    if (!tenantKey) continue;

    const { DeliveryFeeModel } = getTenantModels(tenantKey);
    const deliveryFees = await DeliveryFeeModel.find({
      isDeleted: { $ne: true }
    }).lean();

    if (!deliveryFees.length) continue;

    const result = await DeliveryFeeModel.bulkWrite(
      deliveryFees.map((deliveryFee) => ({
        updateOne: {
          filter: { _id: deliveryFee._id },
          update: {
            $set: {
              fee: normalizeFee(deliveryFee.fee),
              freeOver: normalizeLegacyAmount(deliveryFee.freeOver)
            }
          }
        }
      })),
      { ordered: false }
    );

    updatedFees += result.modifiedCount;
  }

  console.log(`Delivery fee migration complete. Updated ${updatedFees} records.`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
