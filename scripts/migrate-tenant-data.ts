import mongoose from 'mongoose';

import { connectDatabase } from '@config/database';
import {
  getTenantModels,
  initializeTenantDatabase,
  tenantDatabaseName
} from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';

type LegacyCollection = {
  legacyName: string;
  tenantName: keyof ReturnType<typeof getTenantModels>;
  newCollectionName: string;
};

const legacyCollections: LegacyCollection[] = [
  { legacyName: 'users', tenantName: 'UserModel', newCollectionName: 'users' },
  { legacyName: 'products', tenantName: 'ProductModel', newCollectionName: 'products' },
  { legacyName: 'categories', tenantName: 'CategoryModel', newCollectionName: 'categories' },
  { legacyName: 'orders', tenantName: 'OrderModel', newCollectionName: 'orders' },
  { legacyName: 'carts', tenantName: 'CartModel', newCollectionName: 'carts' },
  { legacyName: 'phoneotps', tenantName: 'PhoneOtpModel', newCollectionName: 'phone_otps' },
  {
    legacyName: 'admincustomers',
    tenantName: 'AdminCustomerModel',
    newCollectionName: 'admin_customers'
  },
  { legacyName: 'promotions', tenantName: 'PromotionModel', newCollectionName: 'promotions' },
  {
    legacyName: 'deliveryfees',
    tenantName: 'DeliveryFeeModel',
    newCollectionName: 'delivery_fees'
  },
  {
    legacyName: 'tenantadminsettings',
    tenantName: 'TenantAdminSettingsModel',
    newCollectionName: 'tenant_admin_settings'
  },
  {
    legacyName: 'storefrontcarouselslides',
    tenantName: 'StorefrontCarouselSlideModel',
    newCollectionName: 'storefront_carousel_slides'
  },
  {
    legacyName: 'storefronthighlighticons',
    tenantName: 'StorefrontHighlightIconModel',
    newCollectionName: 'storefront_highlight_icons'
  },
  {
    legacyName: 'storefrontproductsectionassignments',
    tenantName: 'StorefrontProductSectionAssignmentModel',
    newCollectionName: 'storefront_product_section_assignments'
  }
];

const collectionExists = async (name: string): Promise<boolean> => {
  if (!mongoose.connection.db) throw new Error('MongoDB connection is not ready');
  const collections = await mongoose.connection.db.listCollections({ name }).toArray();
  return collections.length > 0;
};

const databaseExists = async (name: string): Promise<boolean> => {
  const admin = mongoose.connection.db?.admin();
  if (!admin) throw new Error('MongoDB connection is not ready');
  const databases = await admin.listDatabases();
  return databases.databases.some((database) => database.name === name);
};

const withFixedTenantId = (
  document: Record<string, unknown>,
  tenantId: string
): Record<string, unknown> => ({
  ...document,
  tenantId
});

const run = async (): Promise<void> => {
  await connectDatabase();

  const tenants = await TenantModel.find({ isDeleted: { $ne: true } }).lean();
  const dropLegacy = process.env.DROP_LEGACY_TENANT_COLLECTIONS === 'true';
  const dropLegacyDatabases = process.env.DROP_LEGACY_TENANT_DATABASES === 'true';

  for (const tenant of tenants) {
    const tenantId = tenant.tenantId || String(tenant._id);
    const databaseName = tenantDatabaseName(tenant.slug);
    const legacyDatabaseNames = [
      tenant.databaseName,
      tenantDatabaseName(tenantId),
      tenantDatabaseName(tenant.slug)
    ].filter((name): name is string => Boolean(name && name !== databaseName));

    await TenantModel.updateOne({ _id: tenant._id }, { tenantId, databaseName });
    await initializeTenantDatabase(tenant.slug);

    const models = getTenantModels(tenant.slug);
    let copiedForTenant = 0;

    for (const collection of legacyCollections) {
      if (!(await collectionExists(collection.legacyName))) continue;

      const documents = await mongoose.connection
        .collection(collection.legacyName)
        .find({ tenantId: { $in: [tenantId, tenant.slug] } })
        .toArray();
      if (documents.length === 0) continue;

      const tenantCollection = models[collection.tenantName].db.collection(
        collection.newCollectionName
      );
      await tenantCollection.bulkWrite(
        documents.map((document) => ({
          replaceOne: {
            filter: { _id: document._id },
            replacement: withFixedTenantId(document, tenantId),
            upsert: true
          }
        })),
        { ordered: false }
      );
      copiedForTenant += documents.length;
    }

    for (const legacyDatabaseName of legacyDatabaseNames) {
      if (!(await databaseExists(legacyDatabaseName))) continue;

      const legacyDb = mongoose.connection.useDb(legacyDatabaseName, { useCache: true });

      for (const collection of legacyCollections) {
        const exists = await legacyDb.db
          ?.listCollections({ name: collection.newCollectionName })
          .toArray();
        if (!exists || exists.length === 0) continue;

        const documents = await legacyDb
          .collection(collection.newCollectionName)
          .find({})
          .toArray();
        if (documents.length === 0) continue;

        const tenantCollection = models[collection.tenantName].db.collection(
          collection.newCollectionName
        );
        await tenantCollection.bulkWrite(
          documents.map((document) => ({
            replaceOne: {
              filter: { _id: document._id },
              replacement: withFixedTenantId(document, tenantId),
              upsert: true
            }
          })),
          { ordered: false }
        );
        copiedForTenant += documents.length;
      }

      if (dropLegacyDatabases) {
        await legacyDb.dropDatabase();
        console.info(`Dropped legacy tenant database ${legacyDatabaseName}`);
      }
    }

    console.info(
      `Migrated ${copiedForTenant} documents for tenant ${tenant.slug} into ${databaseName}`
    );
  }

  if (dropLegacy) {
    for (const collection of legacyCollections) {
      if (await collectionExists(collection.legacyName)) {
        await mongoose.connection.collection(collection.legacyName).drop();
        console.info(`Dropped legacy collection ${collection.legacyName}`);
      }
    }
  } else {
    console.info(
      'Legacy collections were left untouched. Set DROP_LEGACY_TENANT_COLLECTIONS=true to drop them after verifying migration.'
    );
  }

  if (!dropLegacyDatabases) {
    console.info(
      'Legacy tenant databases were left untouched. Set DROP_LEGACY_TENANT_DATABASES=true to drop them after verifying migration.'
    );
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
