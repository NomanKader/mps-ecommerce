import mongoose from 'mongoose';

import { connectDatabase } from '@config/database';
import { Role } from '@common/enums/role.enum';
import {
  getTenantModels,
  initializeTenantDatabase,
  tenantDatabaseName
} from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';
import { hashPassword } from '@utils/password';

const tenantSlug = 'demo';
const adminEmail = 'admin@demo.com';
const adminPassword = 'Admin12345!';

const run = async (): Promise<void> => {
  await connectDatabase();

  const existingTenant = await TenantModel.findOne({
    slug: tenantSlug,
    isDeleted: { $ne: true }
  }).lean();
  const tenantObjectId = existingTenant?._id ?? new mongoose.Types.ObjectId();
  const tenantId = existingTenant?.tenantId ?? String(tenantObjectId);

  await initializeTenantDatabase(tenantSlug);

  const {
    CategoryModel,
    DeliveryFeeModel,
    OrderModel,
    ProductModel,
    PromotionModel,
    StorefrontCarouselSlideModel,
    StorefrontHighlightIconModel,
    StorefrontProductSectionAssignmentModel,
    TenantAdminSettingsModel,
    UserModel
  } = getTenantModels(tenantSlug);

  await TenantModel.findOneAndUpdate(
    { slug: tenantSlug },
    {
      _id: tenantObjectId,
      tenantId,
      name: "AV's Store",
      slug: tenantSlug,
      databaseName: tenantDatabaseName(tenantSlug),
      status: 'active',
      subscriptionPlan: 'growth',
      settings: { currency: 'MMK', locale: 'en', timezone: 'Asia/Yangon' }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await UserModel.findOneAndUpdate(
    { tenantId, email: adminEmail },
    {
      tenantId,
      email: adminEmail,
      firstName: 'Tenant',
      lastName: 'Admin',
      role: Role.TENANT_ADMIN,
      isActive: true,
      password: await hashPassword(adminPassword)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await TenantAdminSettingsModel.findOneAndUpdate(
    { tenantId },
    {
      tenantId,
      deliveryHeadline: 'Delivery across Yangon',
      supportPhoneCountryCode: '+95',
      supportPhoneNumber: '09 123 456 789',
      topBarTagline: 'Fresh groceries for modern households'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const categories = await Promise.all(
    [
      {
        name: 'Fresh Produce',
        slug: 'fresh-produce',
        icon: '🥬',
        color: '#16a34a',
        subcategories: ['Vegetables', 'Fruit']
      },
      {
        name: 'Pantry',
        slug: 'pantry',
        icon: '🥫',
        color: '#ca8a04',
        subcategories: ['Rice', 'Canned Goods']
      },
      {
        name: 'Dairy',
        slug: 'dairy',
        icon: '🥛',
        color: '#2563eb',
        subcategories: ['Milk', 'Cheese']
      }
    ].map((category) =>
      CategoryModel.findOneAndUpdate(
        { tenantId, slug: category.slug },
        { ...category, tenantId },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const products = await Promise.all(
    [
      {
        name: 'Organic Baby Spinach',
        sku: 'DEMO-SPINACH-001',
        categoryName: 'Fresh Produce',
        subcategory: 'Vegetables',
        tags: ['organic', 'leafy'],
        price: 4500,
        stock: 24,
        rating: 4.7,
        status: 'active'
      },
      {
        name: 'Jasmine Rice 5kg',
        sku: 'DEMO-RICE-005',
        categoryName: 'Pantry',
        subcategory: 'Rice',
        tags: ['staple'],
        price: 13300,
        stock: 68,
        rating: 4.8,
        status: 'active'
      },
      {
        name: 'Whole Milk 1L',
        sku: 'DEMO-MILK-001',
        categoryName: 'Dairy',
        subcategory: 'Milk',
        tags: ['daily'],
        price: 2800,
        stock: 18,
        rating: 4.5,
        status: 'active'
      }
    ].map((product, index) =>
      ProductModel.findOneAndUpdate(
        { tenantId, sku: product.sku },
        {
          ...product,
          tenantId,
          categoryId: String(categories[index]?._id),
          currency: 'MMK'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    [
      {
        orderNumber: 'DEMO-1001',
        userId: 'seed-customer-1',
        customerName: 'May Hnin',
        customerEmail: 'may@example.com',
        customerPhone: '+959111111111',
        deliveryAddress: 'Bahan, Yangon',
        region: 'Yangon',
        township: 'Bahan',
        itemCount: 3,
        totalAmount: 42500,
        status: 'processing',
        placedAt: new Date()
      },
      {
        orderNumber: 'DEMO-1002',
        userId: 'seed-customer-2',
        customerName: 'Aung Ko',
        customerEmail: 'aung@example.com',
        customerPhone: '+959222222222',
        deliveryAddress: 'Sanchaung, Yangon',
        region: 'Yangon',
        township: 'Sanchaung',
        itemCount: 2,
        totalAmount: 28000,
        status: 'fulfilled',
        placedAt: new Date(Date.now() - 86400000)
      }
    ].map((order) =>
      OrderModel.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        { ...order, tenantId, itemsCount: order.itemCount, currency: 'MMK' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await PromotionModel.findOneAndUpdate(
    { tenantId, code: 'WELCOME10' },
    {
      tenantId,
      campaign: 'Welcome Offer',
      code: 'WELCOME10',
      discount: '10%',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: 'active',
      uses: 12
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await DeliveryFeeModel.findOneAndUpdate(
    { tenantId, region: 'Yangon', township: 'Bahan' },
    {
      tenantId,
      region: 'Yangon',
      township: 'Bahan',
      fee: 4500,
      freeOver: 15000,
      eta: '45-60 min',
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await StorefrontCarouselSlideModel.findOneAndUpdate(
    { tenantId, placement: 'hero', sortOrder: 1 },
    {
      tenantId,
      placement: 'hero',
      title: 'Fresh picks for today',
      description: 'Seasonal produce, pantry staples, and dairy delivered quickly.',
      eyebrow: 'Daily Market',
      cta: 'Shop Fresh',
      targetCategoryId: String(categories[0]?._id),
      sortOrder: 1,
      status: 'active',
      startsAt: new Date(Date.now() - 86400000)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await StorefrontHighlightIconModel.findOneAndUpdate(
    { tenantId, section: 'featured', label: 'Fresh Produce' },
    {
      tenantId,
      section: 'featured',
      label: 'Fresh Produce',
      icon: '🥬',
      color: '#166534',
      surfaceColor: '#dcfce7',
      textColor: '#14532d',
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await StorefrontProductSectionAssignmentModel.findOneAndUpdate(
    { tenantId, sectionId: 'top-offers', productId: String(products[0]?._id), status: 'active' },
    {
      tenantId,
      sectionId: 'top-offers',
      productId: String(products[0]?._id),
      sortOrder: 1,
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.info(`Seeded tenant admin dashboard data.
Tenant: ${tenantId}
Slug: ${tenantSlug}
Admin email: ${adminEmail}
Admin password: ${adminPassword}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
