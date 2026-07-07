import mongoose from 'mongoose';

import { connectDatabase } from '@config/database';
import { Role } from '@common/enums/role.enum';
import {
  getTenantModels,
  initializeTenantDatabase,
  tenantDatabaseName
} from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';
import { S3Service, StorefrontImageMetadata } from '@shared/services/s3.service';
import { hashPassword } from '@utils/password';

const tenantSlug = 'av';
const adminEmail = 'tenant.admin@av.com';
const adminPassword = 'Admin12345!';
const customerEmail = 'may.customer@example.com';
const customerPassword = 'Customer12345!';

const image = (id: string, width = 900, height = 620): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=85`;

type SeedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type CarouselSeedSlide = {
  cta: string;
  description: string;
  eyebrow: string;
  headline: string;
  imageSourceUrl: string;
  metric: string;
  partner: string;
  placement: 'hero' | 'showcase';
  sortOrder: number;
  targetCategoryId?: string;
  targetSearch?: string;
  title: string;
};

const s3Service = new S3Service();

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const downloadSeedImage = async (
  sourceUrl: string,
  placement: CarouselSeedSlide['placement'],
  sortOrder: number
): Promise<SeedImageFile> => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Unable to download carousel seed image: ${sourceUrl}`);
  }

  const mimetype = response.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  const extension = extensionByMimeType[mimetype] ?? 'jpg';
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    buffer,
    mimetype,
    originalname: `${placement}-carousel-${sortOrder}.${extension}`,
    size: buffer.byteLength
  };
};

type ProductSeed = readonly [
  categoryName: string,
  subcategory: string,
  sku: string,
  name: string,
  price: number,
  rating: number,
  stock: number,
  description: string,
  imageUrl: string
];

const categorySeeds = [
  {
    name: 'Meat',
    slug: 'meat',
    icon: '🥩',
    color: '#dc2626',
    subcategories: ['Beef', 'Chicken', 'Seafood']
  },
  {
    name: 'Vegetable',
    slug: 'vegetable',
    icon: '🥬',
    color: '#22c55e',
    subcategories: ['Leafy Greens', 'Root Vegetables', 'Fresh Herbs']
  },
  {
    name: 'Pantry',
    slug: 'pantry',
    icon: '🥫',
    color: '#7c3aed',
    subcategories: ['Rice', 'Canned Goods', 'Cooking Oil']
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    icon: '🍎',
    color: '#16a34a',
    subcategories: ['Tropical', 'Citrus', 'Berries']
  },
  {
    name: 'Vegetables',
    slug: 'vegetables',
    icon: '🥦',
    color: '#1fbf61',
    subcategories: ['Organic Greens', 'Salad Mix', 'Mushrooms']
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: '🥤',
    color: '#0891b2',
    subcategories: ['Juice', 'Tea', 'Water']
  },
  {
    name: 'Dairy',
    slug: 'dairy',
    icon: '🥛',
    color: '#2563eb',
    subcategories: ['Milk', 'Cheese', 'Yogurt']
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: '🥐',
    color: '#d97706',
    subcategories: ['Bread', 'Pastry', 'Cake']
  }
];

const productSeeds = [
  ['Vegetable', 'Leafy Greens', 'AV-VEG-001', 'Organic Romaine Hearts', 4200, 5, 96, 'crisp romaine bunches for salads and wraps', image('photo-1518977676601-b53f82aba655')],
  ['Vegetable', 'Leafy Greens', 'AV-VEG-002', 'Baby Spinach Box', 3800, 4.9, 82, 'washed baby spinach for everyday cooking', image('photo-1576045057995-568f588f82fb')],
  ['Vegetable', 'Fresh Herbs', 'AV-VEG-003', 'Fragrant Basil Pack', 2600, 4.8, 54, 'fresh basil leaves for curries, salads, and pasta', image('photo-1618164435735-413d3b066c9a')],
  ['Vegetable', 'Root Vegetables', 'AV-VEG-004', 'Sweet Carrot Bundle', 3200, 4.7, 71, 'bright carrots selected for sweetness', image('photo-1447175008436-054170c2e979')],
  ['Vegetable', 'Organic Greens', 'AV-VEG-005', 'Green Kale Bunch', 4500, 4.8, 46, 'nutrient-rich kale harvested this week', image('photo-1524179091875-bf99a9a6af57')],
  ['Vegetable', 'Salad Mix', 'AV-VEG-006', 'Avocado Pair', 6900, 4.6, 38, 'ripe avocados ready for breakfast and salads', image('photo-1523049673857-eb18f1d7b578')],
  ['Vegetable', 'Mushrooms', 'AV-VEG-007', 'Button Mushrooms 250g', 3900, 4.7, 44, 'clean white mushrooms with firm texture', image('photo-1504545102780-26774c1bb073')],
  ['Vegetable', 'Fresh Herbs', 'AV-VEG-008', 'Coriander and Mint Duo', 1800, 4.5, 88, 'aromatic herb duo for soups and salads', image('photo-1535189487909-a262ad10c165')],
  ['Meat', 'Beef', 'AV-MEAT-001', 'Premium Beef Steak', 18500, 4.8, 28, 'tender steak cuts packed fresh', image('photo-1607623814075-e51df1bdc82f')],
  ['Meat', 'Chicken', 'AV-MEAT-002', 'Free Range Chicken', 12500, 4.6, 34, 'whole chicken prepared for family meals', image('photo-1587593810167-a84920ea0781')],
  ['Pantry', 'Rice', 'AV-PAN-001', 'Myanmar Paw San Rice 5kg', 21500, 4.9, 115, 'premium fragrant rice for daily meals', image('photo-1536304993881-ff6e9eefa2a6')],
  ['Pantry', 'Cooking Oil', 'AV-PAN-002', 'Sunflower Oil 1L', 7200, 4.5, 65, 'light cooking oil for home kitchens', image('photo-1474979266404-7eaacbcd87c5')],
  ['Fruits', 'Tropical', 'AV-FRU-001', 'Sweet Banana Hand', 3400, 4.7, 90, 'naturally sweet bananas for snacks', image('photo-1571771894821-ce9b6c11b08e')],
  ['Fruits', 'Berries', 'AV-FRU-002', 'Imported Blueberries', 9800, 4.6, 22, 'juicy blueberries for breakfast bowls', image('photo-1498557850523-fd3d118b962e')],
  ['Beverages', 'Juice', 'AV-BEV-001', 'Cold Pressed Orange Juice', 5200, 4.5, 49, 'fresh citrus juice with no added sugar', image('photo-1600271886742-f049cd451bba')],
  ['Dairy', 'Milk', 'AV-DAI-001', 'Fresh Whole Milk 1L', 3600, 4.8, 76, 'daily whole milk chilled and sealed', image('photo-1550583724-b2692b85b150')],
  ['Bakery', 'Bread', 'AV-BAK-001', 'Sourdough Country Loaf', 6500, 4.7, 31, 'crusty loaf baked every morning', image('photo-1509440159596-0249088772ff')]
] as const satisfies readonly ProductSeed[];

const productNameParts = [
  'Select',
  'Market Fresh',
  'Family Pack',
  'Premium',
  'Everyday',
  'Organic',
  'Chef Choice',
  'Value',
  'Signature',
  'Harvest',
  'Kitchen Ready',
  'Local',
  'Imported',
  'Golden',
  'Classic'
];

const productForms = [
  'Bundle',
  'Tray',
  'Pack',
  'Box',
  'Jar',
  'Bag',
  'Bottle',
  'Pouch',
  'Set',
  'Cut'
];

const productImageIds = [
  'photo-1542838132-92c53300491e',
  'photo-1540420773420-3366772f4999',
  'photo-1506368249639-73a05d6f6488',
  'photo-1550583724-b2692b85b150',
  'photo-1509440159596-0249088772ff',
  'photo-1571771894821-ce9b6c11b08e',
  'photo-1607623814075-e51df1bdc82f',
  'photo-1536304993881-ff6e9eefa2a6',
  'photo-1600271886742-f049cd451bba',
  'photo-1498557850523-fd3d118b962e',
  'photo-1474979266404-7eaacbcd87c5',
  'photo-1523049673857-eb18f1d7b578'
];

const generatedProductSeeds = categorySeeds.flatMap((category, categoryIndex) =>
  Array.from({ length: 15 }, (_, itemIndex): ProductSeed => {
    const subcategory = category.subcategories[itemIndex % category.subcategories.length] ?? 'Featured';
    const adjective =
      productNameParts[(categoryIndex + itemIndex) % productNameParts.length] ?? 'Market';
    const form = productForms[(categoryIndex * 2 + itemIndex) % productForms.length] ?? 'Pack';
    const skuPrefix = category.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const imageId =
      productImageIds[(categoryIndex * 3 + itemIndex) % productImageIds.length] ??
      'photo-1542838132-92c53300491e';

    return [
      category.name,
      subcategory,
      `AV-${String(categoryIndex + 1).padStart(2, '0')}-${skuPrefix}-GEN-${String(
        itemIndex + 1
      ).padStart(3, '0')}`,
      `${adjective} ${subcategory} ${form}`,
      1800 + categoryIndex * 900 + itemIndex * 350,
      Number((4.1 + ((categoryIndex + itemIndex) % 9) / 10).toFixed(1)),
      20 + ((categoryIndex + 1) * (itemIndex + 7)) % 130,
      `${adjective.toLowerCase()} ${subcategory.toLowerCase()} ${form.toLowerCase()} prepared for presentation catalog browsing`,
      image(imageId, 900, 620)
    ];
  })
);

const allProductSeeds = [...productSeeds, ...generatedProductSeeds];

const customerFirstNames = [
  'May',
  'Aung',
  'Su',
  'Kyaw',
  'Thandar',
  'Nilar',
  'Htet',
  'Myo',
  'Ei',
  'Zin',
  'Wai',
  'Nyein'
];

const customerLastNames = [
  'Hnin',
  'Ko',
  'Mon',
  'Min',
  'Aye',
  'Win',
  'Naing',
  'Tun',
  'Moe',
  'Lwin'
];

const townshipSeeds = ['Bahan', 'Sanchaung', 'Kamayut', 'Mayangone'];

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
    AddressModel,
    AdminCustomerModel,
    CartModel,
    CategoryModel,
    CustomerWalletModel,
    DeliveryFeeModel,
    FavoriteModel,
    OrderModel,
    PageSegmentModel,
    ProductModel,
    PromotionModel,
    RegionModel,
    SecondaryCategoryModel,
    ShoppingListModel,
    StorefrontCarouselSlideModel,
    StorefrontHighlightIconModel,
    StorefrontProductSectionAssignmentModel,
    TenantAdminSettingsModel,
    TownshipModel,
    UserModel,
    WalletTopUpRequestModel
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

  const existingAdminUser = await UserModel.findOne({ tenantId, email: adminEmail });
  const adminUser =
    existingAdminUser ??
    (await UserModel.create({
      tenantId,
      email: adminEmail,
      firstName: 'Tenant',
      lastName: 'Admin',
      phone: '+9598877594332',
      role: Role.TENANT_ADMIN,
      isActive: true,
      password: await hashPassword(adminPassword)
    }));

  const customerUser = await UserModel.findOneAndUpdate(
    { tenantId, email: customerEmail },
    {
      tenantId,
      email: customerEmail,
      firstName: 'May',
      lastName: 'Hnin',
      phone: '+959111111111',
      role: Role.CUSTOMER,
      isActive: true,
      password: await hashPassword(customerPassword)
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await TenantAdminSettingsModel.findOneAndUpdate(
    { tenantId },
    {
      tenantId,
      deliveryHeadline: 'Delivery all over Myanmar',
      logoUrl: '',
      supportPhoneCountryCode: '+95',
      supportPhoneNumber: '8877594332',
      topBarTagline: 'Sustainable Grocery Shopping'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const categories = await Promise.all(
    categorySeeds.map((category) =>
      CategoryModel.findOneAndUpdate(
        { tenantId, slug: category.slug },
        { ...category, tenantId, itemCount: 0 },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const products = await Promise.all(
    allProductSeeds.map(
      ([categoryName, subcategory, sku, name, price, rating, stock, description, imageUrl]) => {
        const category = categoryByName.get(categoryName);
        return ProductModel.findOneAndUpdate(
          { tenantId, sku },
          {
            tenantId,
            name,
            sku,
            categoryId: String(category?._id),
            categoryName,
            subcategory,
            description,
            tags: [categoryName.toLowerCase(), subcategory.toLowerCase(), 'presentation'],
            imageUrl,
            price,
            currency: 'MMK',
            stock,
            rating,
            status: 'active'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    )
  );

  await Promise.all(
    categories.map((category) =>
      CategoryModel.updateOne(
        { _id: category._id },
        {
          itemCount: products.filter((product) => product.categoryId === String(category._id))
            .length
        }
      )
    )
  );

  const pantryCategory = categoryByName.get('Pantry');
  const vegetableCategory = categoryByName.get('Vegetable');
  const vegetableProducts = products.filter((product) => product.categoryName === 'Vegetable');

  const region = await RegionModel.findOneAndUpdate(
    { tenantId, name: 'Yangon' },
    { tenantId, country: 'Myanmar', name: 'Yangon', status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Promise.all(
    townshipSeeds.map((township) =>
      TownshipModel.findOneAndUpdate(
        { tenantId, regionId: region._id, name: township },
        { tenantId, country: 'Myanmar', regionId: region._id, region: 'Yangon', name: township, status: 'active' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    [
      { township: townshipSeeds[0], fee: 4500, freeOver: 15000, eta: '45-60 min' },
      { township: townshipSeeds[1], fee: 5000, freeOver: 18000, eta: '50-65 min' },
      { township: townshipSeeds[2], fee: 5500, freeOver: 20000, eta: '55-70 min' },
      { township: townshipSeeds[3], fee: 6500, freeOver: 25000, eta: '60-80 min' }
    ].map(({ township, fee, freeOver, eta }) =>
      DeliveryFeeModel.findOneAndUpdate(
        { tenantId, region: 'Yangon', township },
        { tenantId, region: 'Yangon', township, fee, freeOver, eta, status: 'active' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await AddressModel.findOneAndUpdate(
    { tenantId, userId: String(customerUser._id), label: 'home' },
    {
      tenantId,
      userId: String(customerUser._id),
      label: 'home',
      recipientName: 'May Hnin',
      phone: '+959111111111',
      addressLine1: 'No. 18, Kabar Aye Pagoda Road',
      addressLine2: 'Near Bahan Market',
      city: 'Yangon',
      township: 'Bahan',
      region: 'Yangon',
      landmark: 'Bahan Market',
      deliveryInstructions: 'Call before arrival',
      isDefault: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Promise.all(
    [
      { name: 'May Hnin', email: customerEmail, segment: 'VIP', orders: 18, totalSpend: 942000, daysAgo: 1 },
      { name: 'Aung Ko', email: 'aung.customer@example.com', segment: 'Loyal', orders: 9, totalSpend: 418000, daysAgo: 4 },
      { name: 'Su Mon', email: 'sumon.customer@example.com', segment: 'New', orders: 2, totalSpend: 75500, daysAgo: 8 },
      { name: 'Kyaw Min', email: 'kyaw.customer@example.com', segment: 'At Risk', orders: 4, totalSpend: 128000, daysAgo: 45 }
    ].map(({ name, email, segment, orders, totalSpend, daysAgo }) =>
      AdminCustomerModel.findOneAndUpdate(
        { tenantId, email },
        {
          tenantId,
          name,
          email,
          segment,
          orders,
          totalSpend,
          lastOrderAt: new Date(Date.now() - Number(daysAgo) * 86400000)
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const generatedCustomers = await Promise.all(
    Array.from({ length: 120 }, (_, index) => {
      const firstName = customerFirstNames[index % customerFirstNames.length];
      const lastName = customerLastNames[(index * 3) % customerLastNames.length];
      const email = `presentation.customer.${String(index + 1).padStart(3, '0')}@example.com`;
      const segment = (['VIP', 'Loyal', 'New', 'At Risk'] as const)[index % 4];
      const orders = 1 + ((index * 7) % 34);
      const totalSpend = 25000 + orders * (9000 + (index % 11) * 1300);

      return AdminCustomerModel.findOneAndUpdate(
        { tenantId, email },
        {
          tenantId,
          name: `${firstName} ${lastName}`,
          email,
          segment,
          orders,
          totalSpend,
          lastOrderAt: new Date(Date.now() - ((index % 60) + 1) * 86400000)
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await Promise.all(
    [
      { code: 'WELCOME10', campaign: 'Welcome Offer', discount: '10%', status: 'active', uses: 37, days: 30 },
      { code: 'FRESH15', campaign: 'Fresh Produce Week', discount: '15%', status: 'active', uses: 24, days: 14 },
      { code: 'PAYDAY5K', campaign: 'Payday Basket Saver', discount: '5000 MMK', status: 'scheduled', uses: 0, days: 45 }
    ].map(({ code, campaign, discount, status, uses, days }) =>
      PromotionModel.findOneAndUpdate(
        { tenantId, code },
        {
          tenantId,
          campaign,
          code,
          discount,
          startsAt: new Date(Date.now() - 86400000),
          endsAt: new Date(Date.now() + Number(days) * 86400000),
          status,
          uses
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const carouselSeedSlides: CarouselSeedSlide[] = [
    {
      placement: 'hero',
      sortOrder: 1,
      title: 'Fresh groceries for every basket',
      description: 'Shop daily produce, pantry staples, and chilled essentials.',
      eyebrow: 'Daily Market',
      cta: 'Shop now',
      headline: 'Fresh',
      metric: 'Daily',
      partner: 'AV Market',
      imageSourceUrl: image('photo-1542838132-92c53300491e', 1500, 620),
      targetCategoryId: String(vegetableCategory?._id),
      targetSearch: 'fresh'
    },
    {
      placement: 'hero',
      sortOrder: 2,
      title: 'Fast delivery across Yangon',
      description: 'Curated products packed carefully for the same-day run.',
      eyebrow: 'Same Day',
      cta: 'Browse deals',
      headline: 'Fast',
      metric: 'Same day',
      partner: 'Delivery team',
      imageSourceUrl: image('photo-1604719312566-8912e9227c6a', 1500, 620),
      targetCategoryId: String(vegetableCategory?._id),
      targetSearch: 'deals'
    },
    {
      placement: 'hero',
      sortOrder: 3,
      title: 'Pantry staples ready for the week',
      description: 'Build a complete basket with rice, oils, snacks, and household essentials.',
      eyebrow: 'Weekly Stock-up',
      cta: 'Stock up',
      headline: 'Pantry',
      metric: 'Weekly',
      partner: 'Storefront edit',
      imageSourceUrl: image('photo-1583258292688-d0213dc5a3a8', 1500, 620),
      targetCategoryId: String(pantryCategory?._id),
      targetSearch: 'pantry'
    },
    {
      placement: 'showcase',
      sortOrder: 1,
      title: 'Partner shops',
      description: 'Explore trusted ranges in one place.',
      eyebrow: 'Partner brands',
      cta: 'View shops',
      headline: 'Shops',
      metric: 'Featured',
      partner: 'Supporting copy',
      imageSourceUrl: image('photo-1607082349566-187342175e2f', 900, 620),
      targetCategoryId: 'all',
      targetSearch: 'shops'
    },
    {
      placement: 'showcase',
      sortOrder: 2,
      title: 'Fresh picks for your kitchen',
      description: 'Seasonal vegetables and fruit selected for everyday meals.',
      eyebrow: 'Curated this week',
      cta: 'Shop fresh',
      headline: 'Fresh',
      metric: 'New',
      partner: 'Produce counter',
      imageSourceUrl: image('photo-1488459716781-31db52582fe9', 900, 620),
      targetCategoryId: String(vegetableCategory?._id),
      targetSearch: 'vegetables'
    },
    {
      placement: 'showcase',
      sortOrder: 3,
      title: 'Offers for bigger baskets',
      description: 'Promotions on daily essentials, pantry packs, and family favourites.',
      eyebrow: 'Weekly offers',
      cta: 'See offers',
      headline: 'Offers',
      metric: 'Promo',
      partner: 'Savings edit',
      imageSourceUrl: image('photo-1607083206869-4c7672e72a8a', 900, 620),
      targetCategoryId: 'all',
      targetSearch: 'offer'
    }
  ];

  await Promise.all(
    carouselSeedSlides.map(async ({ imageSourceUrl, ...slide }) => {
      const existingSlide =
        (await StorefrontCarouselSlideModel.findOne({
          tenantId,
          placement: slide.placement,
          sortOrder: slide.sortOrder,
          isDeleted: { $ne: true }
        }).lean()) ??
        (await StorefrontCarouselSlideModel.findOne({
          tenantId,
          placement: slide.placement,
          sortOrder: slide.sortOrder
        }).lean());
      const imageMetadata: StorefrontImageMetadata = existingSlide?.imageDriveFileId
        ? {
            imageDriveFileId: existingSlide.imageDriveFileId,
            imageMimeType: existingSlide.imageMimeType ?? 'image/jpeg',
            imageName: existingSlide.imageName ?? '',
            imageSize: existingSlide.imageSize ?? 0
          }
        : await s3Service.uploadStorefrontImage(
            await downloadSeedImage(imageSourceUrl, slide.placement, slide.sortOrder),
            tenantId,
            `${slide.placement}-${slide.sortOrder}`
          );

      return StorefrontCarouselSlideModel.findOneAndUpdate(
        existingSlide?._id
          ? { _id: existingSlide._id }
          : { tenantId, placement: slide.placement, sortOrder: slide.sortOrder },
        {
          $set: {
            ...slide,
            ...imageMetadata,
            tenantId,
            isDeleted: false,
            status: 'active',
            startsAt: new Date(Date.now() - 86400000)
          },
          $unset: { imageUrl: '' }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await Promise.all(
    categorySeeds.map((category, index) =>
      StorefrontHighlightIconModel.findOneAndUpdate(
        { tenantId, section: 'featured', label: category.name },
        {
          tenantId,
          section: 'featured',
          label: category.name,
          icon: category.icon,
          color: category.color,
          surfaceColor: '#fff7ed',
          textColor: '#111827',
          sortOrder: index + 1,
          status: 'active'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    categorySeeds.slice(0, 6).map((category, index) => {
      const categoryProducts = products.filter((product) => product.categoryName === category.name);
      return SecondaryCategoryModel.findOneAndUpdate(
        { tenantId, slug: `${category.slug}-collection` },
        {
          tenantId,
          name: category.name,
          slug: `${category.slug}-collection`,
          icon: category.icon,
          color: category.color,
          productId: String(categoryProducts[0]?._id ?? products[0]?._id),
          productIds: categoryProducts.slice(0, 5).map((product) => String(product._id)),
          targetSectionId: index % 2 === 0 ? 'top-offers' : 'new-season',
          status: 'active'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await StorefrontProductSectionAssignmentModel.deleteMany({ tenantId });
  await Promise.all(
    products.slice(0, 80).map((product, index) =>
      StorefrontProductSectionAssignmentModel.create({
        tenantId,
        sectionId: (['top-offers', 'top-blooms', 'new-season', 'pantry-ready'] as const)[index % 4],
        productId: String(product._id),
        sortOrder: index + 1,
        status: 'active'
      })
    )
  );

  await PageSegmentModel.findOneAndUpdate(
    { tenantId, title: 'Shop Vegetable' },
    {
      tenantId,
      title: 'Shop Vegetable',
      primaryCategoryId: String(vegetableCategory?._id),
      displaySlot: 'after-storefront-icons',
      icon: '🥬',
      imageUrl: image('photo-1441974231531-c6227db76b6e', 840, 520),
      topCarousel: [
        {
          text: 'Slider one',
          imageUrl: image('photo-1441974231531-c6227db76b6e', 1500, 620),
          sortOrder: 1
        },
        {
          text: 'Farm fresh vegetables',
          imageUrl: image('photo-1540420773420-3366772f4999', 1500, 620),
          sortOrder: 2
        }
      ],
      afterNewProductsCarousel: [
        {
          text: 'Fresh harvest bundles',
          imageUrl: image('photo-1506368249639-73a05d6f6488', 1500, 520),
          sortOrder: 1
        }
      ],
      haveYouSeenCards: [
        {
          text: 'Leafy green picks',
          imageUrl: image('photo-1441974231531-c6227db76b6e', 720, 520),
          sortOrder: 1
        },
        {
          text: 'Chef ready vegetables',
          imageUrl: image('photo-1540420773420-3366772f4999', 720, 520),
          sortOrder: 2
        }
      ],
      sortOrder: 1,
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const pageSegmentSeeds = [
    {
      categoryName: 'Beverages',
      title: 'Shop Beverages',
      icon: '🥤',
      imageUrl: image('photo-1621506289937-a8e4df240d0b', 840, 520),
      colorSlide: 'Cold pressed drinks',
      topImage: image('photo-1621506289937-a8e4df240d0b', 1500, 620),
      secondImage: image('photo-1544145945-f90425340c7e', 1500, 520),
      cardOne: image('photo-1621506289937-a8e4df240d0b', 720, 520),
      cardTwo: image('photo-1556679343-c7306c1976bc', 720, 520)
    },
    {
      categoryName: 'Fruits',
      title: 'Shop Fruits',
      icon: '🍎',
      imageUrl: image('photo-1571771894821-ce9b6c11b08e', 840, 520),
      colorSlide: 'Sweet seasonal fruit',
      topImage: image('photo-1571771894821-ce9b6c11b08e', 1500, 620),
      secondImage: image('photo-1619566636858-adf3ef46400b', 1500, 520),
      cardOne: image('photo-1571771894821-ce9b6c11b08e', 720, 520),
      cardTwo: image('photo-1488459716781-31db52582fe9', 720, 520)
    },
    {
      categoryName: 'Vegetables',
      title: 'Shop Green Veg',
      icon: '🌿',
      imageUrl: image('photo-1557844352-761f2565b576', 840, 520),
      colorSlide: 'Organic greens',
      topImage: image('photo-1557844352-761f2565b576', 1500, 620),
      secondImage: image('photo-1540420773420-3366772f4999', 1500, 520),
      cardOne: image('photo-1557844352-761f2565b576', 720, 520),
      cardTwo: image('photo-1512621776951-a57141f2eefd', 720, 520)
    },
    {
      categoryName: 'Meat',
      title: 'Shop Meat',
      icon: '🥩',
      imageUrl: image('photo-1607623814075-e51df1bdc82f', 840, 520),
      colorSlide: 'Butcher quality at home',
      topImage: image('photo-1607623814075-e51df1bdc82f', 1500, 620),
      secondImage: image('photo-1551028150-64b9f398f678', 1500, 520),
      cardOne: image('photo-1607623814075-e51df1bdc82f', 720, 520),
      cardTwo: image('photo-1587593810167-a84920ea0781', 720, 520)
    },
    {
      categoryName: 'Pantry',
      title: 'Shop Pantry',
      icon: '🥫',
      imageUrl: image('photo-1516684732162-798a0062be99', 840, 520),
      colorSlide: 'Daily pantry staples',
      topImage: image('photo-1516684732162-798a0062be99', 1500, 620),
      secondImage: image('photo-1506368249639-73a05d6f6488', 1500, 520),
      cardOne: image('photo-1516684732162-798a0062be99', 720, 520),
      cardTwo: image('photo-1471943311424-646960669fbc', 720, 520)
    }
  ];

  await Promise.all(
    pageSegmentSeeds.map((segment, index) => {
      const category = categoryByName.get(segment.categoryName);

      return PageSegmentModel.findOneAndUpdate(
        { tenantId, title: segment.title },
        {
          tenantId,
          title: segment.title,
          primaryCategoryId: String(category?._id),
          displaySlot: 'after-new-in-season',
          icon: segment.icon,
          imageUrl: segment.imageUrl,
          topCarousel: [
            {
              text: segment.colorSlide,
              imageUrl: segment.topImage,
              sortOrder: 1
            },
            {
              text: `${segment.categoryName} picks`,
              imageUrl: segment.secondImage,
              sortOrder: 2
            }
          ],
          afterNewProductsCarousel: [
            {
              text: `Fresh ${segment.categoryName.toLowerCase()} arrivals`,
              imageUrl: segment.secondImage,
              sortOrder: 1
            }
          ],
          haveYouSeenCards: [
            {
              text: segment.title,
              imageUrl: segment.cardOne,
              sortOrder: 1
            },
            {
              text: `${segment.categoryName} essentials`,
              imageUrl: segment.cardTwo,
              sortOrder: 2
            }
          ],
          sortOrder: index + 2,
          status: 'active'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await Promise.all(
    [
      {
        orderNumber: 'DEMO-1001',
        userId: String(customerUser._id),
        customerName: 'May Hnin',
        customerEmail,
        customerPhone: '+959111111111',
        city: 'Yangon',
        deliveryAddress: 'Bahan, Yangon',
        region: 'Yangon',
        township: 'Bahan',
        itemCount: 5,
        itemsCount: 5,
        subtotalAmount: 42500,
        deliveryFee: 0,
        totalAmount: 42500,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        status: 'processing',
        placedAt: new Date()
      },
      {
        orderNumber: 'DEMO-1002',
        userId: String(customerUser._id),
        customerName: 'May Hnin',
        customerEmail,
        customerPhone: '+959111111111',
        city: 'Yangon',
        deliveryAddress: 'Sanchaung, Yangon',
        region: 'Yangon',
        township: 'Sanchaung',
        itemCount: 3,
        itemsCount: 3,
        subtotalAmount: 28000,
        deliveryFee: 5000,
        totalAmount: 33000,
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        status: 'fulfilled',
        placedAt: new Date(Date.now() - 86400000)
      }
    ].map((order) =>
      OrderModel.findOneAndUpdate(
        { tenantId, orderNumber: order.orderNumber },
        { ...order, tenantId, currency: 'MMK' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const generatedOrderCustomers = [
    { name: 'May Hnin', email: customerEmail, userId: String(customerUser._id) },
    ...generatedCustomers.map((customer) => ({
      name: customer.name,
      email: customer.email,
      userId: `presentation-customer-${customer._id}`
    }))
  ];

  await Promise.all(
    Array.from({ length: 240 }, (_, index) => {
      const customer = generatedOrderCustomers[index % generatedOrderCustomers.length];
      const product = products[index % products.length];
      const itemCount = 1 + (index % 8);
      const township = townshipSeeds[index % townshipSeeds.length] ?? 'Bahan';
      const deliveryFee = itemCount > 4 ? 0 : 4500 + (index % 4) * 500;
      const subtotalAmount = (product?.price ?? 5000) * itemCount + (index % 5) * 1200;
      const status = (
        ['pending', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'] as const
      )[index % 6];

      return OrderModel.findOneAndUpdate(
        { tenantId, orderNumber: `DEMO-BULK-${String(index + 1).padStart(4, '0')}` },
        {
          tenantId,
          userId: customer?.userId ?? String(customerUser._id),
          orderNumber: `DEMO-BULK-${String(index + 1).padStart(4, '0')}`,
          customerName: customer?.name ?? 'May Hnin',
          customerEmail: customer?.email ?? customerEmail,
          customerPhone: `+959${String(300000000 + index).padStart(9, '0')}`,
          city: 'Yangon',
          deliveryAddress: `${township}, Yangon`,
          region: 'Yangon',
          township,
          itemCount,
          itemsCount: itemCount,
          subtotalAmount,
          deliveryFee,
          totalAmount: subtotalAmount + deliveryFee,
          paymentMethod: index % 3 === 0 ? 'wallet' : 'cash_on_delivery',
          paymentStatus: index % 3 === 0 ? 'paid' : 'pending',
          status,
          placedAt: new Date(Date.now() - (index % 90) * 86400000),
          currency: 'MMK'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await CustomerWalletModel.findOneAndUpdate(
    { tenantId, userId: String(customerUser._id) },
    {
      tenantId,
      userId: String(customerUser._id),
      balance: 125000,
      reservedBalance: 0,
      transactions: [
        {
          amount: 150000,
          createdAt: new Date(Date.now() - 3 * 86400000),
          description: 'Initial presentation wallet top-up',
          direction: 'credit',
          kind: 'top-up',
          referenceId: 'TOPUP-DEMO-001'
        },
        {
          amount: 25000,
          createdAt: new Date(Date.now() - 86400000),
          description: 'Wallet payment for fresh basket',
          direction: 'debit',
          kind: 'wallet-payment',
          referenceId: 'DEMO-1001'
        }
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await WalletTopUpRequestModel.findOneAndUpdate(
    { tenantId, userId: String(customerUser._id), receiptImageKey: 'presentation/topup-receipt.jpg' },
    {
      tenantId,
      userId: String(customerUser._id),
      customerName: 'May Hnin',
      customerEmail,
      customerPhone: '+959111111111',
      amount: 150000,
      promoCode: 'WELCOME10',
      paymentMethod: 'KBZPay',
      receiptImageName: 'topup-receipt.jpg',
      receiptImageMimeType: 'image/jpeg',
      receiptImageSize: 128000,
      receiptImageKey: 'presentation/topup-receipt.jpg',
      status: 'approved',
      reviewedBy: String(adminUser._id),
      reviewedAt: new Date(Date.now() - 2 * 86400000),
      approvedAmount: 150000,
      adminNote: 'Seeded approved top-up'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await CartModel.findOneAndUpdate(
    { tenantId, userId: String(customerUser._id), status: 'active' },
    {
      tenantId,
      userId: String(customerUser._id),
      items: vegetableProducts.slice(0, 3).map((product, index) => ({
        productId: String(product._id),
        quantity: index + 1
      })),
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Promise.all(
    vegetableProducts.slice(0, 4).map((product) =>
      FavoriteModel.findOneAndUpdate(
        { tenantId, userId: String(customerUser._id), productId: String(product._id) },
        { tenantId, userId: String(customerUser._id), productId: String(product._id) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await ShoppingListModel.findOneAndUpdate(
    { tenantId, userId: String(customerUser._id), name: 'Weekly fresh basket' },
    {
      tenantId,
      userId: String(customerUser._id),
      name: 'Weekly fresh basket',
      productIds: vegetableProducts.slice(0, 6).map((product) => String(product._id))
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.info(`Seeded presentation data.
Tenant slug: ${tenantSlug}
Tenant id: ${tenantId}
Admin email: ${adminEmail}
Admin password: ${adminPassword}
Customer email: ${customerEmail}
Customer password: ${customerPassword}
Categories: ${categories.length}
Products: ${products.length}
Generated customers: ${generatedCustomers.length}
Generated orders: 240
Page segment: Shop Vegetable`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
