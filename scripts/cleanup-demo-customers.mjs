// Dry run: node scripts/cleanup-demo-customers.mjs --tenant=av
// Apply:   node scripts/cleanup-demo-customers.mjs --tenant=av --apply
import console from 'node:console';
import process from 'node:process';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ quiet: true });

const demoEmails = [
  'may.customer@example.com',
  'aung.customer@example.com',
  'sumon.customer@example.com',
  'kyaw.customer@example.com'
];
const demoCustomerPattern = /^presentation\.customer\.\d{3}@example\.com$/;
const demoOrderPattern = /^DEMO-(?:100[12]|BULK-\d{4})$/;

async function run() {
  const slug = process.argv.find((arg) => arg.startsWith('--tenant='))?.slice('--tenant='.length);
  if (!slug) throw new Error('Pass --tenant=<slug> to select the tenant.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const tenant = await mongoose.connection.db
    .collection('tenants')
    .findOne({ slug, isDeleted: { $ne: true } });
  if (!tenant?.databaseName || !tenant.tenantId) throw new Error('Tenant database not found.');
  const db = mongoose.connection.useDb(tenant.databaseName).db;
  const tenantId = tenant.tenantId;
  const emailFilter = { $or: [{ email: demoCustomerPattern }, { email: { $in: demoEmails } }] };
  const customerFilter = { tenantId, isDeleted: { $ne: true }, ...emailFilter };
  const orderFilter = {
    tenantId,
    orderNumber: demoOrderPattern,
    $or: [{ customerEmail: demoCustomerPattern }, { customerEmail: { $in: demoEmails } }]
  };
  const customers = await db.collection('admin_customers').find(customerFilter).toArray();
  const orders = await db.collection('orders').find(orderFilter).toArray();
  const nonDemoOrders = await db
    .collection('orders')
    .countDocuments({ tenantId, orderNumber: { $not: demoOrderPattern } });
  const report = {
    tenant: slug,
    database: tenant.databaseName,
    demoCustomers: customers.length,
    demoOrders: orders.length,
    preservedNonDemoOrders: nonDemoOrders
  };
  if (!process.argv.includes('--apply')) {
    console.info(JSON.stringify({ mode: 'dry-run', ...report }));
    return;
  }

  // Keep original BSON documents in the same tenant database before any changes.
  const archive = db.collection('demo_customer_cleanup_archive');
  const archivedAt = new Date();
  for (const [source, documents] of [
    ['admin_customers', customers],
    ['orders', orders]
  ]) {
    if (!documents.length) continue;
    const result = await archive.bulkWrite(
      documents.map((document) => ({
        updateOne: {
          filter: { source, originalId: document._id },
          update: {
            $setOnInsert: { source, originalId: document._id, archivedAt, tenantId, document }
          },
          upsert: true
        }
      })),
      { ordered: true }
    );
    if (!result.isOk()) throw new Error('Archive failed; cleanup stopped.');
  }

  // Soft-delete customers so historical non-demo orders cannot recreate their rows.
  const customerResult = await db
    .collection('admin_customers')
    .updateMany(
      { ...customerFilter, _id: { $in: customers.map((customer) => customer._id) } },
      { $set: { isDeleted: true, updatedAt: archivedAt } }
    );
  const orderResult = await db.collection('orders').deleteMany({
    ...orderFilter,
    _id: { $in: orders.map((order) => order._id) }
  });
  console.info(
    JSON.stringify({
      mode: 'applied',
      ...report,
      hiddenCustomers: customerResult.modifiedCount,
      removedDemoOrders: orderResult.deletedCount,
      archiveCollection: archive.collectionName
    })
  );
  const remaining = await db
    .collection('orders')
    .countDocuments({ tenantId, orderNumber: { $not: demoOrderPattern } });
  if (remaining !== nonDemoOrders)
    throw new Error('Non-demo order count changed; review the archive.');
}

run()
  .catch((error) => {
    console.error(
      error instanceof mongoose.Error.MongooseServerSelectionError
        ? 'Database connection unavailable.'
        : error.message
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
