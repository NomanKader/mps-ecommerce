import { useEffect, useMemo, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { Box, Checkbox, Grid, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { categoryApi } from '@features/category/api/categoryApi';
import { useCart } from '@features/cart/hooks/useCart';
import { useI18n } from '@features/i18n/I18nProvider';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import {
  featuredCategoryHighlights,
  storefrontCategories,
  storefrontCategoryMenuItems,
} from '@features/home/data/homePage.data';
import type { FeatureHighlight, StoreProduct } from '@features/home/types/home.types';
import { useProducts } from '@features/product/hooks/useProducts';
import { routePaths } from '@routes/routePaths';
import {
  StoreProductCard,
  StoreProductCardSkeleton,
} from '@shared/components/storefront/StoreProductCard';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { ProductFilters } from '@widgets/ProductFilters/ProductFilters';
import { ProductGrid } from '@widgets/ProductGrid/ProductGrid';

const categoryLabels: Record<string, string> = {
  all: 'Catalog',
  bakery: 'Bakery',
  care: 'Self-care',
  'cat-1': 'Fresh Produce',
  'cat-2': 'Bakery',
  'cat-3': 'Pantry',
  dairy: 'Dairy',
  drinks: 'Drinks',
  flowers: 'Flowers',
  frozen: 'Frozen',
  fruits: 'Fruits',
  gifts: 'Gifts',
  home: 'Home',
  kids: 'Kids',
  meat: 'Meat',
  pantry: 'Pantry',
  pets: 'Pets',
  'quick-meals': 'Quick Meals',
  seafood: 'Seafood',
  vegetables: 'Vegetables',
};

type CategoryShowcaseConfig = {
  accent: string;
  featureHighlights: FeatureHighlight[];
  filterProducts: string[];
  heroImage: string;
  heroKicker: string;
  heroTitle: string;
  posterTitles: string[];
  posters: string[];
  promoImage: string;
  promoTitle: string;
  sections: { icon: string; label: string }[];
  title: string;
};

const fallbackCategoryImages = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
];

const categoryShowcaseConfigs: Record<string, CategoryShowcaseConfig> = {
  bakery: {
    accent: '#7e7b74',
    featureHighlights: [
      { color: '#7e7b74', icon: '🍞', id: 'baked-today', label: 'Baked Today' },
      { color: '#b9263d', icon: '🥐', id: 'buttery', label: 'Cafe Favourites' },
      { color: '#d2aa2d', icon: '🎂', id: 'celebration', label: 'Celebration' },
      { color: '#1fa44d', icon: '🌾', id: 'wholegrain', label: 'Wholegrain' },
    ],
    filterProducts: [
      'Sourdough (22)',
      'Croissants (18)',
      'Birthday Cakes (12)',
      'Cookies (28)',
      'Bagels (16)',
      'Dinner Rolls (24)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Fresh from the oven',
    heroTitle: 'BAKERY COMFORTS',
    posterTitles: ['Warm Loaves for Every Table', 'Sweet Bakes and Cafe Treats'],
    posters: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'bakery shelf',
    sections: storefrontCategoryMenuItems.bakery ?? [],
    title: 'Bakery',
  },
  care: {
    accent: '#ded7cb',
    featureHighlights: [
      { color: '#b9263d', icon: '🧴', id: 'daily-care', label: 'Daily Care' },
      { color: '#1fa44d', icon: '🧼', id: 'clean', label: 'Clean Home' },
      { color: '#d2aa2d', icon: '🧖', id: 'beauty', label: 'Beauty' },
      { color: '#35508f', icon: '🪥', id: 'dental', label: 'Dental' },
    ],
    filterProducts: [
      'Body Wash (18)',
      'Hand Soap (22)',
      'Dental Care (19)',
      'Cleaning Sprays (16)',
      'Paper Goods (25)',
      'Skin Care (14)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Clean routines',
    heroTitle: 'SELF-CARE ESSENTIALS',
    posterTitles: ['Personal Care Made Simple', 'Household Cleaning Refills'],
    posters: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'care cupboard',
    sections: storefrontCategoryMenuItems.care ?? [],
    title: 'Self-Care',
  },
  dairy: {
    accent: '#d9d0c2',
    featureHighlights: [
      { color: '#8cc84a', icon: '🥛', id: 'chilled', label: 'Chilled' },
      { color: '#35508f', icon: '🧀', id: 'cheese', label: 'Cheese Board' },
      { color: '#d2aa2d', icon: '🥚', id: 'eggs', label: 'Breakfast' },
      { color: '#b9263d', icon: '🍦', id: 'dessert', label: 'Desserts' },
    ],
    filterProducts: [
      'Fresh Milk (20)',
      'Cheese (34)',
      'Butter (10)',
      'Yoghurt (28)',
      'Eggs (16)',
      'Desserts (22)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Chilled daily',
    heroTitle: 'DAIRY FAVOURITES',
    posterTitles: ['Milk, Yoghurt and Breakfast Basics', 'Cheese for Cooking and Boards'],
    posters: [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'chilled dairy',
    sections: storefrontCategoryMenuItems.dairy ?? [],
    title: 'Dairy',
  },
  drinks: {
    accent: '#21af44',
    featureHighlights: [
      { color: '#21af44', icon: '🥤', id: 'refreshing', label: 'Refreshing' },
      { color: '#62c5f0', icon: '💧', id: 'hydration', label: 'Hydration' },
      { color: '#b9263d', icon: '🧃', id: 'lunchbox', label: 'Lunchbox' },
      { color: '#7e7b74', icon: '☕', id: 'hot-drinks', label: 'Hot Drinks' },
    ],
    filterProducts: [
      'Soft Drinks (44)',
      'Juices (32)',
      'Water (38)',
      'Coffee (21)',
      'Tea (18)',
      'Ice (8)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Serve cold',
    heroTitle: 'DRINKS FOR EVERY MOMENT',
    posterTitles: ['Chilled Drinks and Mixers', 'Coffee, Tea and Daily Sips'],
    posters: [
      'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'cold drinks',
    sections: storefrontCategoryMenuItems.drinks ?? [],
    title: 'Drinks',
  },
  flowers: {
    accent: '#97c84c',
    featureHighlights: [
      { color: '#b9263d', icon: '💐', id: 'bouquets', label: 'Bouquets' },
      { color: '#d2aa2d', icon: '🌻', id: 'bright', label: 'Bright Picks' },
      { color: '#1fa44d', icon: '🪴', id: 'plants', label: 'Plants' },
      { color: '#35508f', icon: '🎀', id: 'arranged', label: 'Arranged' },
    ],
    filterProducts: [
      'Bouquets (28)',
      'Roses (16)',
      'Tulips (12)',
      'Plants (20)',
      'Sunflowers (9)',
      'Arrangements (18)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Fresh stems',
    heroTitle: 'FLOWERS THAT ARRIVE BRIGHT',
    posterTitles: ['Bouquets for Gifting', 'Plants and Table Arrangements'],
    posters: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'fresh flowers',
    sections: storefrontCategoryMenuItems.flowers ?? [],
    title: 'Flowers',
  },
  frozen: {
    accent: '#62c5f0',
    featureHighlights: [
      { color: '#62c5f0', icon: '❄️', id: 'frozen', label: 'Frozen' },
      { color: '#35508f', icon: '🍕', id: 'pizza', label: 'Pizza Night' },
      { color: '#b9263d', icon: '🍨', id: 'ice-cream', label: 'Ice Cream' },
      { color: '#1fa44d', icon: '🥦', id: 'veg', label: 'Frozen Veg' },
    ],
    filterProducts: [
      'Ready Meals (42)',
      'Frozen Fruit (18)',
      'Frozen Vegetables (26)',
      'Frozen Seafood (20)',
      'Frozen Chips (16)',
      'Ice Cream (34)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Stock the freezer',
    heroTitle: 'FROZEN FAVOURITES',
    posterTitles: ['Freezer Meals for Busy Nights', 'Desserts, Chips and Party Bites'],
    posters: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'freezer aisle',
    sections: storefrontCategoryMenuItems.frozen ?? [],
    title: 'Frozen',
  },
  fruits: {
    accent: '#8cc84a',
    featureHighlights: [
      { color: '#8cc84a', icon: '🍓', id: 'seasonal', label: 'Seasonal' },
      { color: '#d2aa2d', icon: '🥭', id: 'tropical', label: 'Tropical' },
      { color: '#b9263d', icon: '🍎', id: 'crisp', label: 'Crisp' },
      { color: '#1fa44d', icon: '🍇', id: 'sweet', label: 'Sweet Picks' },
    ],
    filterProducts: [
      'Apples (28)',
      'Bananas (14)',
      'Berries (32)',
      'Citrus (24)',
      'Mangoes (18)',
      'Melons (10)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Picked ripe',
    heroTitle: 'FRUIT THAT FEELS SEASONAL',
    posterTitles: ['Breakfast Fruit and Berries', 'Tropical Picks for Sharing'],
    posters: [
      'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'fresh fruit market',
    sections: storefrontCategoryMenuItems.fruits ?? [],
    title: 'Fruits',
  },
  gifts: {
    accent: '#e2c14f',
    featureHighlights: [
      { color: '#d2aa2d', icon: '🎁', id: 'gift-boxes', label: 'Gift Boxes' },
      { color: '#b9263d', icon: '🍫', id: 'chocolate', label: 'Chocolate' },
      { color: '#1fa44d', icon: '🧺', id: 'hampers', label: 'Hampers' },
      { color: '#35508f', icon: '💳', id: 'cards', label: 'Gift Cards' },
    ],
    filterProducts: [
      'Gift Boxes (18)',
      'E-Gift Cards (8)',
      'Chocolate Gifts (22)',
      'Flower Gifts (12)',
      'Hampers (16)',
      'Custom Gifts (10)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Ready to give',
    heroTitle: 'GIFTS WITH GOOD TASTE',
    posterTitles: ['Hampers Built for Sharing', 'Flowers, Chocolate and Cards'],
    posters: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'gift edit',
    sections: storefrontCategoryMenuItems.gifts ?? [],
    title: 'Gifts',
  },
  home: {
    accent: '#35508f',
    featureHighlights: [
      { color: '#35508f', icon: '🧻', id: 'paper', label: 'Paper Goods' },
      { color: '#1fa44d', icon: '🧽', id: 'cleaning', label: 'Cleaning' },
      { color: '#d2aa2d', icon: '🕯️', id: 'fragrance', label: 'Fragrance' },
      { color: '#7e7b74', icon: '🧺', id: 'laundry', label: 'Laundry' },
    ],
    filterProducts: [
      'Kitchen Rolls (24)',
      'Cleaning (38)',
      'Home Fragrance (12)',
      'Laundry (22)',
      'Tableware (14)',
      'Batteries (10)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Home ready',
    heroTitle: 'HOUSEHOLD ESSENTIALS',
    posterTitles: ['Cleaning Supplies That Work', 'Laundry, Paper and Table Basics'],
    posters: [
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'home essentials',
    sections: storefrontCategoryMenuItems.home ?? [],
    title: 'Home',
  },
  kids: {
    accent: '#b9263d',
    featureHighlights: [
      { color: '#b9263d', icon: '🍼', id: 'baby', label: 'Baby Food' },
      { color: '#d2aa2d', icon: '🥣', id: 'breakfast', label: 'Breakfast' },
      { color: '#21af44', icon: '🧃', id: 'lunchbox', label: 'Lunchbox' },
      { color: '#35508f', icon: '🧸', id: 'play', label: 'Play' },
    ],
    filterProducts: [
      'Baby Food (18)',
      'Kids Breakfast (16)',
      'Lunchbox Drinks (24)',
      'Kids Snacks (28)',
      'Toys (14)',
      'Baby Care (20)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Family favourites',
    heroTitle: 'KIDS LUNCHBOX PICKS',
    posterTitles: ['Snack Packs for School Days', 'Baby Care and Little Treats'],
    posters: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'kids essentials',
    sections: storefrontCategoryMenuItems.kids ?? [],
    title: 'Kids',
  },
  meat: {
    accent: '#c12a3f',
    featureHighlights: [
      { color: '#b9263d', icon: '🥩', id: 'butcher', label: 'Butcher Cut' },
      { color: '#35508f', icon: '🍗', id: 'chicken', label: 'Chicken' },
      { color: '#7e7b74', icon: '🥓', id: 'deli', label: 'Deli' },
      { color: '#d2aa2d', icon: '🍔', id: 'grill', label: 'Grill Ready' },
    ],
    filterProducts: [
      'Beef (30)',
      'Chicken (42)',
      'Lamb (16)',
      'Cold Cuts (18)',
      'Sausages (20)',
      'Burgers (12)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Butcher quality',
    heroTitle: 'MEAT FOR EVERY MEAL',
    posterTitles: ['Prime Cuts and Weeknight Packs', 'Grill Picks and Deli Favourites'],
    posters: [
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'butcher counter',
    sections: storefrontCategoryMenuItems.meat ?? [],
    title: 'Meat',
  },
  pantry: {
    accent: '#97c84c',
    featureHighlights: [
      { color: '#97c84c', icon: '🥫', id: 'stock-up', label: 'Stock Up' },
      { color: '#d2aa2d', icon: '🍝', id: 'pasta', label: 'Pasta Night' },
      { color: '#b9263d', icon: '🍫', id: 'treats', label: 'Treats' },
      { color: '#35508f', icon: '🧂', id: 'seasoning', label: 'Seasoning' },
    ],
    filterProducts: [
      'Cereals (24)',
      'Cans & Jars (44)',
      'Chocolate (32)',
      'Condiments (28)',
      'Pasta (26)',
      'Rice & Grains (20)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Cupboard ready',
    heroTitle: 'PANTRY STAPLES',
    posterTitles: ['Cans, Jars and Cooking Basics', 'Snacks, Sweets and Breakfast'],
    posters: [
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'pantry staples',
    sections: storefrontCategoryMenuItems.pantry ?? [],
    title: 'Pantry',
  },
  pets: {
    accent: '#8b8782',
    featureHighlights: [
      { color: '#8b8782', icon: '🐶', id: 'dog', label: 'Dog Food' },
      { color: '#35508f', icon: '🐱', id: 'cat', label: 'Cat Food' },
      { color: '#d2aa2d', icon: '🦴', id: 'treats', label: 'Treats' },
      { color: '#1fa44d', icon: '🧼', id: 'care', label: 'Pet Care' },
    ],
    filterProducts: [
      'Dog Food (26)',
      'Cat Food (24)',
      'Treats (30)',
      'Pet Toys (16)',
      'Pet Care (14)',
      'Accessories (12)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Pet shelf',
    heroTitle: 'PET FOOD AND CARE',
    posterTitles: ['Meals, Treats and Toys', 'Care and Accessories'],
    posters: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'pet essentials',
    sections: storefrontCategoryMenuItems.pets ?? [],
    title: 'Pets',
  },
  'quick-meals': {
    accent: storefrontColors.accent,
    featureHighlights: [
      ...featuredCategoryHighlights.slice(0, 11),
      { color: storefrontColors.navy, icon: '🏅', id: 'local', label: 'Local' },
    ],
    filterProducts: [
      'Acai (14)',
      'African (2)',
      'Angus Beef (2)',
      'Arabic Sweets (6)',
      'Asian (42)',
      'Bean Curd (5)',
      'Beans (2)',
      'Beef Steak (4)',
      'Beef Strips (2)',
      'Beetroot (2)',
      'Boxed Meals (6)',
      'Breakfast Bowls (2)',
      'Brownies (5)',
      'Cake Jars (2)',
      'Cakes (14)',
      'Cheese Sticks (5)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'GOOD FOOD FAST',
    heroTitle: 'SAVE TIME',
    posterTitles: ['Fast, Flavourful Meals', 'Chef-made and Ready to Enjoy'],
    posters: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'Iceland & the food warehouse',
    sections: storefrontCategoryMenuItems['quick-meals'] ?? [],
    title: 'Quick Meals',
  },
  seafood: {
    accent: '#35508f',
    featureHighlights: [
      { color: '#35508f', icon: '🐟', id: 'fish', label: 'Fresh Fish' },
      { color: '#62c5f0', icon: '🦐', id: 'prawns', label: 'Prawns' },
      { color: '#b9263d', icon: '🍣', id: 'sushi', label: 'Sushi' },
      { color: '#7e7b74', icon: '🥫', id: 'smoked', label: 'Smoked' },
    ],
    filterProducts: [
      'Fresh Fish (28)',
      'Prawns (20)',
      'Crab (8)',
      'Lobster (6)',
      'Sushi (18)',
      'Smoked & Canned (14)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Ocean fresh',
    heroTitle: 'SEAFOOD COUNTER',
    posterTitles: ['Fresh Catch and Shellfish', 'Sushi, Smoked and Ready Seafood'],
    posters: [
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'seafood market',
    sections: storefrontCategoryMenuItems.seafood ?? [],
    title: 'Seafood',
  },
  vegetables: {
    accent: '#2db34b',
    featureHighlights: [
      { color: '#2db34b', icon: '🥬', id: 'greens', label: 'Leafy Greens' },
      { color: '#d2aa2d', icon: '🥕', id: 'roots', label: 'Roots' },
      { color: '#b9263d', icon: '🍅', id: 'tomatoes', label: 'Tomatoes' },
      { color: '#1fa44d', icon: '🥦', id: 'brassicas', label: 'Broccoli' },
    ],
    filterProducts: [
      'Leafy Greens (34)',
      'Root Vegetables (28)',
      'Tomatoes (22)',
      'Broccoli (16)',
      'Cucumbers (18)',
      'Peppers (20)',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1500&q=80',
    heroKicker: 'Fresh market',
    heroTitle: 'VEGETABLES WITH CRUNCH',
    posterTitles: ['Greens, Roots and Roast Veg', 'Salad Staples and Local Picks'],
    posters: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    promoImage:
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1600&q=80',
    promoTitle: 'fresh vegetables',
    sections: storefrontCategoryMenuItems.vegetables ?? [],
    title: 'Vegetables',
  },
};

const quickShowcaseCategoryIds = new Set(storefrontCategories.map((category) => category.id));
const merchandisingPageTitles = new Set([
  'Buy Bulk',
  'Coming Soon',
  'Customised Gift Boxes',
  'E-Gift Cards',
  'Frozen',
  'Gluten-free',
  'Imperfect',
  'Keto',
  'Local',
  'Must Try',
  'New',
  'No Added Sugar',
  'Organic',
  'Promotion',
  'Recipes',
  'Vegan',
]);

const getCategoryConfig = (categoryId: string): CategoryShowcaseConfig => {
  const category = storefrontCategories.find((item) => item.id === categoryId);

  return (
    categoryShowcaseConfigs[categoryId] ?? {
      accent: category?.color ?? storefrontColors.accent,
      featureHighlights: featuredCategoryHighlights.slice(0, 4),
      filterProducts: [
        'Popular Picks (24)',
        'New Arrivals (12)',
        'Best Value (18)',
        'Local (10)',
        'Fresh (16)',
        'Essentials (20)',
      ],
      heroImage: fallbackCategoryImages[0] ?? '',
      heroKicker: 'Curated picks',
      heroTitle: `${category?.label.toUpperCase() ?? 'CATEGORY'} ESSENTIALS`,
      posterTitles: ['Top Picks for This Category', 'Fresh Finds and Daily Essentials'],
      posters: fallbackCategoryImages.slice(1, 3),
      promoImage: fallbackCategoryImages[3] ?? fallbackCategoryImages[0] ?? '',
      promoTitle: category?.label.toLowerCase() ?? 'store favourites',
      sections: storefrontCategoryMenuItems[categoryId] ?? [],
      title: category?.label ?? 'Catalog',
    }
  );
};

const getCategoryProducts = (
  categoryId: string,
  _config: CategoryShowcaseConfig,
  productPool: StoreProduct[],
) => {
  const products = productPool.filter((product) => product.categoryId === categoryId);
  return {
    browsing: products,
    newProducts: products.slice(0, 5),
    topOffers: products.slice(0, 5),
  };
};

const categoryFilters = ['Frozen (484)', 'Kids (12)', 'Meat (38)', 'Quick Meals (907)'];

const subCategoryFilters = [
  'Appetizers (125)',
  'Asian (67)',
  'Breakfast (35)',
  'Desserts (61)',
  'European (40)',
  'Freshly Prepared (26)',
  'Grab & Go (45)',
  'Heat & Eat (161)',
  'Italian (178)',
  'Kids Meals (12)',
  'Sides (52)',
  'Soups & Salads (49)',
  'Sous Vide (15)',
  'Sushi (41)',
];

const gridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: 'repeat(5, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
    sm: 'repeat(2, minmax(0, 1fr))',
    xs: '1fr',
  },
};

const categorySidebarColumnSx = {
  alignSelf: 'flex-start',
  position: { md: 'sticky', xs: 'static' },
  top: { lg: 260, md: 260 },
  zIndex: 2,
};

const categorySidebarMaxHeight = {
  lg: 'calc(100dvh - 284px)',
  md: 'calc(100dvh - 284px)',
  xs: 'none',
};

const sectionTitleSx = {
  color: storefrontColors.navy,
  fontSize: { md: '2rem', xs: '1.55rem' },
  fontWeight: 900,
  lineHeight: 1.1,
};

const merchandisingHeroHeight = { md: 420, xs: 220 };
const categoryHeroHeight = { md: 420, xs: 250 };

const PromoPoster = ({ imageUrl, title }: { imageUrl: string; title: string }) => {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(180deg, ${alpha('#000000', 0)} 0%, ${alpha('#000000', 0.1)} 100%), url(${imageUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        borderRadius: 1,
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          bottom: 28,
          color: '#ffffff',
          fontSize: '1.3rem',
          fontWeight: 900,
          left: '50%',
          px: 3.2,
          py: 1.25,
          position: 'absolute',
          textTransform: 'uppercase',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {t('Shop Now')}
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: alpha(storefrontColors.navyDark, 0.82),
          color: '#ffffff',
          display: 'flex',
          fontSize: '2rem',
          fontWeight: 500,
          justifyContent: 'center',
          left: '50%',
          lineHeight: 1.18,
          maxWidth: 230,
          minHeight: 172,
          p: 2.2,
          position: 'absolute',
          textAlign: 'center',
          top: 88,
          transform: 'translateX(-50%)',
        }}
      >
        {title}
      </Box>
    </Box>
  );
};

const FilterPanel = ({
  embedded = false,
  expanded = false,
  items,
  onToggle,
  placeholder,
  title,
}: {
  embedded?: boolean;
  expanded?: boolean;
  items?: string[];
  onToggle?: () => void;
  placeholder?: string;
  title: string;
}) => (
  <Box
    sx={{
      backgroundColor: '#ffffff',
      border: embedded ? 0 : `1px solid ${alpha('#dfe5ef', 0.95)}`,
      borderBottom: embedded ? `1px solid ${alpha('#dfe5ef', 0.95)}` : undefined,
      borderRadius: embedded ? 0 : 0.6,
      overflow: { md: 'hidden', xs: 'visible' },
      '&:last-of-type': {
        borderBottom: embedded ? 0 : undefined,
      },
    }}
  >
    <Stack
      aria-expanded={expanded}
      component="button"
      direction="row"
      onClick={onToggle}
      sx={{
        alignItems: 'center',
        background: 'transparent',
        borderBottom: expanded ? `1px solid ${alpha('#dfe5ef', 0.95)}` : 0,
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        cursor: 'pointer',
        justifyContent: 'space-between',
        px: 1.8,
        py: 1.4,
        textAlign: 'left',
        width: '100%',
        '&:focus-visible': {
          outline: `3px solid ${alpha(storefrontColors.navy, 0.22)}`,
          outlineOffset: -3,
        },
      }}
      type="button"
    >
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}>
        {title}
      </Typography>
      {expanded ? (
        <KeyboardArrowDownRoundedIcon sx={{ color: storefrontColors.navy, fontSize: 32 }} />
      ) : (
        <KeyboardArrowRightRoundedIcon sx={{ color: storefrontColors.navy, fontSize: 32 }} />
      )}
    </Stack>
    {expanded ? (
      <Stack
        spacing={1.1}
        sx={{
          maxHeight: { md: 360, xs: 'none' },
          overflowY: { md: 'auto', xs: 'visible' },
          p: 1.6,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {placeholder ? (
          <TextField
            placeholder={placeholder}
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1,
                color: '#757b86',
                fontWeight: 600,
              },
            }}
          />
        ) : null}
        {items?.map((item) => (
          <Stack direction="row" key={item} spacing={0.7} sx={{ alignItems: 'center' }}>
            <Checkbox
              size="small"
              sx={{
                color: alpha(storefrontColors.navy, 0.22),
                p: 0,
                '&.Mui-checked': { color: storefrontColors.navy },
              }}
            />
            <Typography sx={{ color: '#5b5c62', fontSize: '0.98rem', fontWeight: 600 }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
    ) : null}
  </Box>
);

const featuredCatalogTargets: Record<string, { category?: string; search: string; title: string }> =
  {
    bulk: { category: 'pantry', search: 'bulk', title: 'Buy Bulk' },
    'baked-today': { category: 'bakery', search: 'fresh', title: 'Baked Today' },
    bright: { category: 'flowers', search: 'bright', title: 'Bright Picks' },
    butcher: { category: 'meat', search: 'butcher', title: 'Butcher Cut' },
    'cafe-favourites': { category: 'bakery', search: 'cafe', title: 'Cafe Favourites' },
    chilled: { category: 'dairy', search: 'chilled', title: 'Chilled' },
    crisp: { category: 'fruits', search: 'crisp', title: 'Crisp' },
    dessert: { category: 'dairy', search: 'dessert', title: 'Desserts' },
    'daily-care': { category: 'care', search: 'care', title: 'Daily Care' },
    'eco-friendly': { search: 'eco', title: 'Eco-Friendly' },
    frozen: { category: 'frozen', search: 'frozen', title: 'Frozen' },
    'gluten-free': { category: 'pantry', search: 'gluten-free', title: 'Gluten-free' },
    imperfect: { category: 'vegetables', search: 'ugly', title: 'Imperfect' },
    keto: { category: 'quick-meals', search: 'keto', title: 'Keto' },
    local: { search: 'local', title: 'Local' },
    'must-try': { search: 'fresh', title: 'Must Try' },
    new: { search: 'new', title: 'New' },
    'no-sugar': { category: 'pantry', search: 'sugar', title: 'No Added Sugar' },
    organic: { search: 'organic', title: 'Organic' },
    promotion: { search: 'offer', title: 'Promotion' },
    recipes: { category: 'quick-meals', search: 'recipe', title: 'Recipes' },
    vegan: { category: 'quick-meals', search: 'vegan', title: 'Vegan' },
  };

const getFeaturedCatalogPath = (item: FeatureHighlight) => {
  const target = featuredCatalogTargets[item.id] ?? {
    search: item.label,
    title: item.label,
  };
  const params = new URLSearchParams({
    category: target.category ?? 'all',
    search: target.search,
    title: target.title,
  });

  return `${routePaths.catalog}?${params.toString()}`;
};

const HighlightIcon = ({ item }: { item: FeatureHighlight }) => (
  <Stack
    component={Link}
    spacing={0.65}
    sx={{
      alignItems: 'center',
      minWidth: 88,
      textDecoration: 'none',
      transition: 'transform 180ms ease',
      '&:hover': {
        transform: 'translateY(-2px)',
      },
    }}
    to={getFeaturedCatalogPath(item)}
  >
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: item.color,
        border: '3px solid #ffffff',
        borderRadius: '50%',
        boxShadow: `0 0 0 1px ${alpha(item.color, 0.2)}`,
        color: item.textColor ?? '#ffffff',
        display: 'flex',
        fontSize: '1.9rem',
        height: 62,
        justifyContent: 'center',
        width: 62,
      }}
    >
      {item.icon}
    </Box>
    <Typography
      sx={{ color: '#56585e', fontSize: '0.86rem', fontWeight: 800, textAlign: 'center' }}
    >
      {item.label}
    </Typography>
  </Stack>
);

const CategoryFilterSidebar = ({
  categoryCount,
  categoryTitle,
  organicCount,
  productFilters,
  promotionCount,
  sections,
  subcategoryCounts,
  newArrivalCount,
  bestValueCount,
}: {
  bestValueCount?: number;
  categoryCount?: number;
  categoryTitle: string;
  newArrivalCount?: number;
  organicCount?: number;
  productFilters: string[];
  promotionCount?: number;
  sections: { icon: string; label: string }[];
  subcategoryCounts?: Record<string, number>;
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: false,
    categories: false,
    featured: false,
    origin: false,
    products: false,
    sort: false,
    subCategory: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const sectionFilters = sections.map(
    (section) => `${section.label} (${subcategoryCounts?.[section.label] ?? 0})`,
  );
  const totalCategoryCount = categoryCount ?? 907;
  const categorySpecificFilters = [
    `${categoryTitle} (${totalCategoryCount})`,
    `Promotion (${promotionCount ?? 48})`,
    `New Arrivals (${newArrivalCount ?? 32})`,
    `Local (${categoryCount ?? 26})`,
    `Organic (${organicCount ?? 18})`,
    `Best Value (${bestValueCount ?? 41})`,
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: `1px solid ${alpha('#dfe5ef', 0.95)}`,
        borderRadius: 1,
        maxHeight: { md: categorySidebarMaxHeight, xs: 'none' },
        overflow: { md: 'auto', xs: 'visible' },
        overscrollBehavior: 'contain',
      }}
    >
      <FilterPanel
        embedded
        expanded={expandedSections.sort}
        items={[
          'New Arrivals',
          'Price (lowest first)',
          'Price (highest first)',
          'From A-Z',
          'From Z-A',
        ]}
        onToggle={() => toggleSection('sort')}
        title="Sort By"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.categories}
        items={categoryTitle === 'Quick Meals' ? categoryFilters : categorySpecificFilters}
        onToggle={() => toggleSection('categories')}
        placeholder="Search Categories..."
        title="Categories"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.subCategory}
        items={categoryTitle === 'Quick Meals' ? subCategoryFilters : sectionFilters}
        onToggle={() => toggleSection('subCategory')}
        placeholder="Search Sub Category..."
        title="Sub Category"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.products}
        items={productFilters}
        onToggle={() => toggleSection('products')}
        placeholder="Search Products..."
        title="Products"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.featured}
        onToggle={() => toggleSection('featured')}
        title="Featured"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.brand}
        onToggle={() => toggleSection('brand')}
        title="Brand"
      />
      <FilterPanel
        embedded
        expanded={expandedSections.origin}
        onToggle={() => toggleSection('origin')}
        title="Origin"
      />
    </Box>
  );
};

const merchandisingHeroImages: Record<string, string> = {
  'Buy Bulk':
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1500&q=80',
  Frozen:
    'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=1500&q=80',
  'Gluten-free':
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1500&q=80',
  Imperfect:
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1500&q=80',
  Keto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1500&q=80',
  Local:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1500&q=80',
  New: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1500&q=80',
  'No Added Sugar':
    'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1500&q=80',
  Organic:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1500&q=80',
  Promotion:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1500&q=80',
  Recipes:
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1500&q=80',
  Vegan:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1500&q=80',
};

const productMatchesMerchandising = (product: StoreProduct, search: string, title: string) => {
  const haystack = [
    product.name,
    product.description,
    product.origin,
    product.sku,
    ...product.tags,
    ...product.badges.map((badge) => badge.label),
  ]
    .join(' ')
    .toLowerCase();
  const normalizedSearch = search.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  if (normalizedSearch && haystack.includes(normalizedSearch)) {
    return true;
  }

  if (normalizedTitle === 'promotion') {
    return (
      haystack.includes('offer') || haystack.includes('promotion') || haystack.includes('sale')
    );
  }

  if (normalizedTitle === 'new') {
    return haystack.includes('new') || haystack.includes('seasonal');
  }

  return haystack.includes(normalizedTitle);
};

const getMerchandisingProducts = (
  title: string,
  category: string,
  search: string,
  productPool: StoreProduct[],
) => {
  const categoryScopedProducts =
    category === 'all'
      ? productPool
      : productPool.filter((product) => product.categoryId === category);
  const matchedProducts = categoryScopedProducts.filter((product) =>
    productMatchesMerchandising(product, search, title),
  );
  const baseConfig = getCategoryConfig(category === 'all' ? 'pantry' : category);
  const fallbackProducts = getCategoryProducts(
    category === 'all' ? 'pantry' : category,
    baseConfig,
    productPool,
  );
  const mergedProducts = [
    ...matchedProducts,
    ...fallbackProducts.topOffers,
    ...fallbackProducts.newProducts,
    ...fallbackProducts.browsing,
  ];

  return Array.from(new Map(mergedProducts.map((product) => [product.id, product])).values()).slice(
    0,
    24,
  );
};

const MerchandisingCollectionPage = ({
  productPool,
  category,
  onAddToCart,
  search,
  title,
}: {
  productPool: StoreProduct[];
  category: string;
  onAddToCart: (product: StoreProduct) => void;
  search: string;
  title: string;
}) => {
  const activeCategory = category === 'all' ? 'quick-meals' : category;
  const config = getCategoryConfig(activeCategory);
  const collectionProducts = getMerchandisingProducts(title, category, search, productPool);
  const shopMenuItems =
    category === 'all'
      ? storefrontCategories
          .filter((item) => item.id !== 'pets' && item.id !== 'gifts')
          .slice(0, 12)
      : config.sections;
  const featureItems = [
    { color: '#7e7b74', icon: '📦', id: 'bulk', label: 'Buy Bulk' },
    ...featuredCategoryHighlights.filter((item) =>
      ['frozen', 'organic', 'gluten-free', 'no-sugar', 'vegan', 'keto'].includes(item.id),
    ),
    { color: '#132f72', icon: '👍', id: 'must-try', label: 'Must Try' },
    { color: '#b9263d', icon: '🏬', id: 'local', label: 'Local' },
    { color: '#1fa44d', icon: '🌿', id: 'eco-friendly', label: 'Eco-Friendly' },
  ];

  return (
    <Box sx={{ backgroundColor: '#ffffff', px: { lg: 5, xs: 2 }, py: { md: 2, xs: 2 } }}>
      <Stack spacing={4.2} sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Grid container spacing={2}>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <Box
              sx={{
                backgroundColor: storefrontColors.navy,
                backgroundImage: `linear-gradient(90deg, ${alpha(storefrontColors.navyDark, 0.9)} 0%, ${alpha(storefrontColors.navy, 0.55)} 42%, ${alpha(storefrontColors.navy, 0.1)} 100%), url(${merchandisingHeroImages[title] ?? config.heroImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                borderRadius: 1,
                height: merchandisingHeroHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  color: '#ffffff',
                  left: { md: 78, xs: 24 },
                  position: 'absolute',
                  top: { md: 78, xs: 52 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { md: '2.6rem', xs: '1.8rem' },
                    fontWeight: 300,
                    lineHeight: 1.1,
                  }}
                >
                  SHOP
                </Typography>
                <Typography
                  sx={{ fontSize: { md: '3.25rem', xs: '2.1rem' }, fontWeight: 900, lineHeight: 1 }}
                >
                  {title.toUpperCase()}
                </Typography>
                <Box
                  sx={{ backgroundColor: storefrontColors.accent, height: 5, mt: 2.2, width: 270 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box>
          <Typography sx={sectionTitleSx}>Shop {title}</Typography>
          <Stack direction="row" spacing={4.5} sx={{ mt: 2.2, overflowX: 'auto', pb: 1.4 }}>
            {shopMenuItems.map((item) => (
              <Stack
                key={item.label}
                spacing={0.85}
                sx={{ alignItems: 'center', flex: '0 0 auto', minWidth: 98 }}
              >
                <Typography
                  aria-hidden="true"
                  sx={{ color: '#b9263d', fontSize: '2.5rem', lineHeight: 1 }}
                >
                  {item.icon}
                </Typography>
                <Typography
                  sx={{
                    color: '#4d4f56',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ borderTop: `1px solid ${alpha('#dfe5ef', 0.9)}`, pt: 3.4 }}>
          <Typography sx={sectionTitleSx}>Featured Categories</Typography>
          <Stack direction="row" spacing={3.8} sx={{ mt: 2.4, overflowX: 'auto', pb: 1.6 }}>
            {featureItems.map((item) => (
              <HighlightIcon item={item} key={item.id} />
            ))}
          </Stack>
        </Box>

        <Box sx={{ borderTop: `1px solid ${alpha('#dfe5ef', 0.9)}`, pt: 3.4 }}>
          <Typography sx={sectionTitleSx}>{title} Collection</Typography>
          <Grid container spacing={2.6} sx={{ mt: 2.6 }}>
            <Grid size={{ lg: 2, md: 3, xs: 12 }} sx={categorySidebarColumnSx}>
              <CategoryFilterSidebar
                categoryTitle={title}
                productFilters={config.filterProducts}
                sections={category === 'all' ? storefrontCategories.slice(0, 12) : config.sections}
              />
            </Grid>
            <Grid size={{ lg: 10, md: 9, xs: 12 }}>
              <Box sx={{ ...gridSx }}>
                {collectionProducts.map((product) => (
                  <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

const CategoryShowcasePage = ({
  categoryId,
  onAddToCart,
  productPool,
}: {
  categoryId: string;
  onAddToCart: (product: StoreProduct) => void;
  productPool: StoreProduct[];
}) => {
  const config = getCategoryConfig(categoryId);
  const products = getCategoryProducts(categoryId, config, productPool);

  return (
    <Box
      sx={{
        backgroundColor: '#ffffff',
        px: { lg: 5, xs: 2 },
        py: { md: 2, xs: 2 },
      }}
    >
      <Stack spacing={4.4} sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Grid container spacing={2}>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <Box
              sx={{
                backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.1) 56%, rgba(0,0,0,0.18) 100%), url(${config.heroImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                borderRadius: 1,
                height: categoryHeroHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  backgroundColor: storefrontColors.navy,
                  color: '#ffffff',
                  left: { md: 340, xs: 24 },
                  maxWidth: 360,
                  p: { md: 3, xs: 2 },
                  position: 'absolute',
                  top: { md: 58, xs: 48 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { md: '2.1rem', xs: '1.6rem' },
                    fontWeight: 300,
                    lineHeight: 1.05,
                  }}
                >
                  <Box component="span" sx={{ display: 'block', fontWeight: 900 }}>
                    {config.heroTitle}
                  </Box>
                  {config.heroKicker}
                </Typography>
                <Box sx={{ backgroundColor: config.accent, height: 4, mt: 2.3, width: '100%' }} />
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box>
          <Typography sx={sectionTitleSx}>Shop {config.title}</Typography>
          <Stack
            direction="row"
            spacing={3.4}
            sx={{
              mt: 2.2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(storefrontColors.navy, 0.2),
                borderRadius: 999,
              },
            }}
          >
            {config.sections.map((section) => (
              <Stack
                key={section.label}
                spacing={0.7}
                sx={{ alignItems: 'center', flex: '0 0 auto', minWidth: 104 }}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    fontSize: '2.6rem',
                    height: 68,
                    justifyContent: 'center',
                  }}
                >
                  {section.icon}
                </Box>
                <Typography
                  sx={{
                    color: '#4d4f56',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {section.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ borderTop: `1px solid ${alpha('#dfe5ef', 0.75)}`, pt: 3.4 }}>
          <Typography sx={sectionTitleSx}>Top Offers</Typography>
          <Box sx={{ ...gridSx, mt: 2.6 }}>
            {products.topOffers.slice(0, 5).map((product) => (
              <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography sx={sectionTitleSx}>New Products</Typography>
          <Box sx={{ ...gridSx, mt: 2.6 }}>
            {products.newProducts.slice(0, 5).map((product) => (
              <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.1)), url(${config.promoImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            borderRadius: 1,
            height: { md: 318, xs: 220 },
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#ffffff',
              boxShadow: `0 12px 26px ${alpha('#000000', 0.18)}`,
              color: storefrontColors.navy,
              fontSize: { md: '3rem', xs: '1.85rem' },
              fontWeight: 900,
              left: '50%',
              px: { md: 4, xs: 2 },
              py: { md: 2.2, xs: 1.5 },
              position: 'absolute',
              textAlign: 'center',
              textTransform: 'lowercase',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: { md: 560, xs: '78%' },
            }}
          >
            {config.promoTitle}
          </Box>
        </Box>

        <Box>
          <Typography sx={sectionTitleSx}>Featured Categories</Typography>
          <Stack direction="row" spacing={2.8} sx={{ mt: 2.2, overflowX: 'auto', pb: 1.4 }}>
            {config.featureHighlights.map((item) => (
              <HighlightIcon item={item} key={item.id} />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography sx={sectionTitleSx}>Have You Seen</Typography>
          <Grid container spacing={2.6} sx={{ mt: 2.6 }}>
            <Grid size={{ lg: 2.4, md: 3.4, xs: 12 }} sx={categorySidebarColumnSx}>
              <CategoryFilterSidebar
                categoryTitle={config.title}
                productFilters={config.filterProducts}
                sections={config.sections}
              />
            </Grid>
            <Grid size={{ lg: 9.6, md: 8.6, xs: 12 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    lg: 'repeat(4, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xs: '1fr',
                  },
                  '& > *': {
                    minWidth: 0,
                  },
                }}
              >
                <PromoPoster
                  imageUrl={config.posters[0] ?? config.heroImage}
                  title={config.posterTitles[0] ?? `${config.title} Picks`}
                />
                <PromoPoster
                  imageUrl={config.posters[1] ?? config.promoImage}
                  title={config.posterTitles[1] ?? `${config.title} Essentials`}
                />
                {products.browsing.slice(0, 3).map((product) => (
                  <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

const PageSegmentCatalogPage = ({
  onAddToCart,
  segmentId,
}: {
  onAddToCart: (product: StoreProduct) => void;
  segmentId: string;
}) => {
  const segmentQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.getStorefrontPageSegment(segmentId, { signal }),
    queryKey: ['storefront', 'page-segment', segmentId],
  });
  const detail = segmentQuery.data;
  const segment = detail?.segment;
  const category = detail?.category;
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const heroSlides = segment?.topCarousel.length ? segment.topCarousel : [];
  const heroSlide = heroSlides[activeHeroSlideIndex] ?? heroSlides[0];
  const secondCarousel = segment?.afterNewProductsCarousel[0];
  const posterCards = segment?.haveYouSeenCards.slice(0, 2) ?? [];
  const categoryTitle = category?.name ?? segment?.title ?? 'Collection';
  const categoryIcon = category?.icon ?? segment?.icon ?? '✦';
  const subcategorySections = (category?.subcategories ?? []).map((subcategory) => ({
    icon: subcategory.icon || categoryIcon,
    label: subcategory.name,
  }));
  const sidebarSections = subcategorySections.length
    ? subcategorySections
    : [{ icon: categoryIcon, label: categoryTitle }];
  const featureHighlights: FeatureHighlight[] = sidebarSections.map((section, index) => ({
    color: category?.color ?? storefrontColors.success,
    icon: section.icon,
    id: `${segmentId}-${index}`,
    label: section.label,
    status: 'active',
  }));
  const filterProducts = (detail?.allProducts ?? []).slice(0, 10).map((product) => product.name);
  const allProducts = detail?.allProducts ?? [];
  const subcategoryCounts = sidebarSections.reduce<Record<string, number>>((counts, section) => {
    counts[section.label] = allProducts.filter(
      (product) => product.unit === section.label || product.origin === section.label,
    ).length;
    return counts;
  }, {});
  const promotionCount = detail?.topOffers.length ?? 0;
  const newArrivalCount = detail?.newProducts.length ?? 0;
  const organicCount = allProducts.filter((product) =>
    [product.name, product.description, ...product.tags]
      .join(' ')
      .toLowerCase()
      .includes('organic'),
  ).length;
  const bestValueCount = allProducts.filter(
    (product) =>
      product.rating >= 4 || product.tags.some((tag) => tag.toLowerCase().includes('value')),
  ).length;
  const heroImage = heroSlide?.imageUrl ?? segment?.imageUrl ?? '';
  const heroTitle = heroSlide?.text || segment?.title || categoryTitle;
  const secondCarouselImage = secondCarousel?.imageUrl ?? segment?.imageUrl ?? heroImage;
  const secondCarouselTitle = secondCarousel?.text || segment?.title || categoryTitle;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setActiveHeroSlideIndex(0), 0);

    return () => window.clearTimeout(timeoutId);
  }, [segmentId]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  if (segmentQuery.isLoading) {
    return (
      <Box sx={{ backgroundColor: '#ffffff', px: { lg: 5, xs: 2 }, py: { md: 2, xs: 2 } }}>
        <Stack spacing={4.4} sx={{ maxWidth: 1600, mx: 'auto' }}>
          <StoreProductCardSkeleton />
        </Stack>
      </Box>
    );
  }

  if (!detail || !segment) {
    return (
      <PageSection
        description="This page segment is no longer available."
        title="Collection unavailable"
      >
        <EmptyState description="Choose another storefront collection." title="No segment found" />
      </PageSection>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#ffffff', px: { lg: 5, xs: 2 }, py: { md: 2, xs: 2 } }}>
      <Stack spacing={4.4} sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Grid container spacing={2}>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <Box
              sx={{
                borderRadius: 1,
                height: categoryHeroHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                key={heroImage}
                sx={{
                  backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.1) 56%, rgba(0,0,0,0.18) 100%), url(${heroImage})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  inset: 0,
                  position: 'absolute',
                  animation: 'pageSegmentHeroFade 650ms ease both',
                  '@keyframes pageSegmentHeroFade': {
                    from: { opacity: 0.35, transform: 'scale(1.015)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
              <Box
                key={heroTitle}
                sx={{
                  backgroundColor: storefrontColors.navy,
                  color: '#ffffff',
                  left: { md: 340, xs: 24 },
                  maxWidth: 360,
                  p: { md: 3, xs: 2 },
                  position: 'absolute',
                  top: { md: 58, xs: 48 },
                  transition: 'opacity 280ms ease, transform 280ms ease',
                }}
              >
                <Typography
                  sx={{
                    fontSize: { md: '2.1rem', xs: '1.6rem' },
                    fontWeight: 900,
                    lineHeight: 1.05,
                  }}
                >
                  {heroTitle}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: category?.color ?? storefrontColors.accent,
                    height: 4,
                    mt: 2.3,
                    width: '100%',
                  }}
                />
              </Box>
              {heroSlides.length > 1 ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    bottom: 18,
                    left: '50%',
                    position: 'absolute',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {heroSlides.map((slide, index) => (
                    <Box
                      aria-label={`Show slide ${index + 1}`}
                      component="button"
                      key={`${slide.imageUrl ?? 'slide'}-${index}`}
                      onClick={() => setActiveHeroSlideIndex(index)}
                      sx={{
                        backgroundColor:
                          index === activeHeroSlideIndex
                            ? storefrontColors.surface
                            : alpha('#ffffff', 0.45),
                        border: 0,
                        borderRadius: 999,
                        cursor: 'pointer',
                        height: 9,
                        p: 0,
                        transition: 'width 180ms ease, background-color 180ms ease',
                        width: index === activeHeroSlideIndex ? 30 : 9,
                      }}
                      type="button"
                    />
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Grid>
        </Grid>

        <Box>
          <Typography sx={sectionTitleSx}>Shop {categoryTitle}</Typography>
          <Stack direction="row" spacing={3.4} sx={{ mt: 2.2, overflowX: 'auto', pb: 1 }}>
            {sidebarSections.map((section) => (
              <Stack
                key={section.label}
                spacing={0.7}
                sx={{ alignItems: 'center', flex: '0 0 auto', minWidth: 104 }}
              >
                <Box sx={{ fontSize: '2.6rem', height: 68 }}>{section.icon}</Box>
                <Typography sx={{ color: '#4d4f56', fontSize: '0.92rem', fontWeight: 600 }}>
                  {section.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ borderTop: `1px solid ${alpha('#dfe5ef', 0.75)}`, pt: 3.4 }}>
          <Typography sx={sectionTitleSx}>Top Offers</Typography>
          <Box sx={{ ...gridSx, mt: 2.6 }}>
            {detail.topOffers.slice(0, 5).map((product) => (
              <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography sx={sectionTitleSx}>New Products</Typography>
          <Box sx={{ ...gridSx, mt: 2.6 }}>
            {detail.newProducts.slice(0, 5).map((product) => (
              <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
            ))}
          </Box>
        </Box>

        {secondCarouselImage ? (
          <Box
            sx={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.1)), url(${secondCarouselImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              borderRadius: 1,
              height: { md: 318, xs: 220 },
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#ffffff',
                boxShadow: `0 12px 26px ${alpha('#000000', 0.18)}`,
                color: storefrontColors.navy,
                fontSize: { md: '3rem', xs: '1.85rem' },
                fontWeight: 900,
                left: '50%',
                px: { md: 4, xs: 2 },
                py: { md: 2.2, xs: 1.5 },
                position: 'absolute',
                textAlign: 'center',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: { md: 560, xs: '78%' },
              }}
            >
              {secondCarouselTitle}
            </Box>
          </Box>
        ) : null}

        <Box>
          <Typography sx={sectionTitleSx}>Featured Categories</Typography>
          <Stack direction="row" spacing={2.8} sx={{ mt: 2.2, overflowX: 'auto', pb: 1.4 }}>
            {featureHighlights.map((item) => (
              <HighlightIcon item={item} key={item.id} />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography sx={sectionTitleSx}>Have You Seen</Typography>
          <Grid container spacing={2.6} sx={{ mt: 2.6 }}>
            <Grid size={{ lg: 2.4, md: 3.4, xs: 12 }} sx={categorySidebarColumnSx}>
              <CategoryFilterSidebar
                bestValueCount={bestValueCount}
                categoryCount={allProducts.length}
                categoryTitle={categoryTitle}
                newArrivalCount={newArrivalCount}
                organicCount={organicCount}
                productFilters={filterProducts}
                promotionCount={promotionCount}
                sections={sidebarSections}
                subcategoryCounts={subcategoryCounts}
              />
            </Grid>
            <Grid size={{ lg: 9.6, md: 8.6, xs: 12 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    lg: 'repeat(4, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xs: '1fr',
                  },
                  '& > *': { minWidth: 0 },
                }}
              >
                {posterCards.map((poster, index) => (
                  <PromoPoster
                    imageUrl={poster.imageUrl ?? heroImage}
                    key={index}
                    title={poster.text || `${categoryTitle} Picks`}
                  />
                ))}
                {detail.allProducts.map((product) => (
                  <StoreProductCard key={product.id} onAddToCart={onAddToCart} product={product} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export const CatalogPage = () => {
  const { addToCart } = useCart();
  const { segmentId } = useParams();
  const { data = [] } = useProducts();
  const { data: categories = [] } = useQuery({
    queryFn: ({ signal }) => categoryApi.getCategories({ signal }),
    queryKey: ['categories'],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const selectedProductIds = useMemo(
    () =>
      (searchParams.get('productIds') ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    [searchParams],
  );
  const categoryOptions = useMemo(
    () => [
      { label: 'All categories', value: 'all' },
      ...categories.map((item) => ({ label: item.name, value: item.id })),
    ],
    [categories],
  );
  const pageTitle =
    searchParams.get('title') ??
    categories.find((item) => item.id === category)?.name ??
    categoryLabels[category] ??
    'Catalog';
  const catalogProducts = data;
  const liveStoreProducts: StoreProduct[] = data.map((product) => ({
    ...product,
    badges: [],
    origin: 'Storefront',
    categoryId:
      categories.find((item) => item.id === product.categoryId)?.slug ?? product.categoryId,
    unit: product.unit ?? 'item',
  }));

  const searchTerms = useMemo(
    () =>
      search
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((term) => (term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term))
        .filter(Boolean),
    [search],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((item) => [item.id, item])),
    [categories],
  );

  const filteredProducts = useMemo(
    () =>
      catalogProducts.filter((product) => {
        if (selectedProductIds.length > 0) {
          return selectedProductIds.includes(product.id);
        }

        const matchesCategory = category === 'all' || product.categoryId === category;
        const productCategory = categoryById.get(product.categoryId);
        const searchableTerms = [
          product.name,
          product.categoryName,
          product.subcategory,
          productCategory?.name,
          productCategory?.slug,
          product.description,
          product.sku,
          ...product.tags,
        ]
          .filter(Boolean)
          .join(' ')
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .map((term) => (term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term));
        const searchableValue = searchableTerms.join(' ');
        const matchesSearch = searchTerms.every((term) => searchableValue.includes(term));

        return matchesCategory && matchesSearch;
      }),
    [catalogProducts, category, categoryById, searchTerms, selectedProductIds],
  );
  const visibleCatalogProducts = selectedProductIds.length
    ? filteredProducts.slice(0, 5)
    : filteredProducts;

  const updateSearchParams = (updates: { category?: string; search?: string }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      nextParams.set('category', updates.category);
      nextParams.set('title', categoryLabels[updates.category] ?? 'Catalog');
      nextParams.delete('productIds');
      nextParams.delete('secondaryCategory');
    }

    if (updates.search !== undefined) {
      nextParams.delete('productIds');
      nextParams.delete('secondaryCategory');

      if (updates.search.trim()) {
        nextParams.set('search', updates.search);
      } else {
        nextParams.delete('search');
      }
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (segmentId) {
    return <PageSegmentCatalogPage onAddToCart={addToCart} segmentId={segmentId} />;
  }

  if (search && merchandisingPageTitles.has(pageTitle)) {
    return (
      <MerchandisingCollectionPage
        productPool={liveStoreProducts}
        category={category}
        onAddToCart={addToCart}
        search={search}
        title={pageTitle}
      />
    );
  }

  if (quickShowcaseCategoryIds.has(category)) {
    return (
      <CategoryShowcasePage
        categoryId={category}
        onAddToCart={addToCart}
        productPool={liveStoreProducts}
      />
    );
  }

  return (
    <Stack spacing={4}>
      <PageSection
        description="Browse all matching products for the selected storefront category."
        title={pageTitle}
      >
        <ProductFilters
          category={category}
          categoryOptions={categoryOptions}
          onCategoryChange={(value) => updateSearchParams({ category: value })}
          onSearchChange={(value) => updateSearchParams({ search: value })}
          search={search}
        />
        {visibleCatalogProducts.length ? (
          <ProductGrid onAddToCart={addToCart} products={visibleCatalogProducts} />
        ) : (
          <EmptyState
            description="Products for this selection will be available soon. Please try another category or search again later."
            title="Items coming soon"
          />
        )}
      </PageSection>
    </Stack>
  );
};
