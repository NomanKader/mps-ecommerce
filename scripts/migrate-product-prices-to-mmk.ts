import mongoose from 'mongoose';

import { connectDatabase } from '@config/database';
import { getTenantModels } from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';

const toMmkAmount = (price: number): number => {
  if (!Number.isFinite(price)) return 100;
  if (price >= 100) return Math.round(price / 100) * 100;
  return Math.max(100, Math.round((price * 1000) / 100) * 100);
};

const run = async (): Promise<void> => {
  await connectDatabase();

  const tenants = await TenantModel.find({ isDeleted: { $ne: true } }).lean();
  let updatedProducts = 0;
  let updatedOrders = 0;
  let updatedCustomers = 0;

  for (const tenant of tenants) {
    const tenantKey = tenant.slug || tenant.tenantId;
    if (!tenantKey) continue;

    await TenantModel.updateOne(
      { _id: tenant._id },
      { $set: { 'settings.currency': 'MMK' } }
    );
    const { AdminCustomerModel, OrderModel, ProductModel } = getTenantModels(tenantKey);
    const products = await ProductModel.find({ isDeleted: { $ne: true } }).lean();
    const orders = await OrderModel.find({}).lean();
    const customers = await AdminCustomerModel.find({}).lean();

    if (products.length) {
      const operations = products.map((product) => ({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              currency: 'MMK',
              price: toMmkAmount(Number(product.price))
            }
          }
        }
      }));

      const result = await ProductModel.bulkWrite(operations, { ordered: false });
      updatedProducts += result.modifiedCount;
    }

    if (orders.length) {
      const result = await OrderModel.bulkWrite(
        orders.map((order) => ({
          updateOne: {
            filter: { _id: order._id },
            update: {
              $set: {
                currency: 'MMK',
                totalAmount: toMmkAmount(Number(order.totalAmount))
              }
            }
          }
        })),
        { ordered: false }
      );
      updatedOrders += result.modifiedCount;
    }

    if (customers.length) {
      const result = await AdminCustomerModel.bulkWrite(
        customers.map((customer) => ({
          updateOne: {
            filter: { _id: customer._id },
            update: {
              $set: {
                totalSpend: toMmkAmount(Number(customer.totalSpend))
              }
            }
          }
        })),
        { ordered: false }
      );
      updatedCustomers += result.modifiedCount;
    }
  }

  console.log(
    `MMK migration complete. Updated ${updatedProducts} products, ${updatedOrders} orders, and ${updatedCustomers} customers.`
  );
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
