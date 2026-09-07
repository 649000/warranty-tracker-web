export const PRODUCT_CATEGORIES = [
  'Audio',
  'Appliances',
  'Phones & Tablets',
  'Computers',
  'TVs & Monitors',
  'Cameras',
  'Wearables',
  'Home & Living',
  'Other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const OTHER_CATEGORY = 'Other';

export interface DurationPreset {
  label: string;
  months?: number;
  lifetime?: boolean;
}

export const DURATION_PRESETS: DurationPreset[] = [
  { label: '6 Months', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
  { label: '3 Years', months: 36 },
  { label: '5 Years', months: 60 },
  { label: 'Lifetime', lifetime: true },
];

export const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'JPY', 'MYR', 'CNY'] as const;

export interface BrandEntry {
  name: string;
  categories?: ProductCategory[];
}

export const BRANDS: BrandEntry[] = [
  { name: 'Apple', categories: ['Phones & Tablets', 'Computers', 'Wearables', 'Audio'] },
  {
    name: 'Samsung',
    categories: ['Phones & Tablets', 'TVs & Monitors', 'Appliances', 'Wearables'],
  },
  { name: 'Sony', categories: ['Audio', 'TVs & Monitors', 'Cameras', 'Phones & Tablets'] },
  { name: 'LG', categories: ['TVs & Monitors', 'Appliances', 'Audio'] },
  { name: 'Panasonic', categories: ['Appliances', 'Audio'] },
  { name: 'Philips', categories: ['Home & Living', 'Appliances', 'Audio'] },
  { name: 'Bosch', categories: ['Appliances', 'Home & Living'] },
  { name: 'Dyson', categories: ['Appliances', 'Home & Living'] },
  { name: 'Bose', categories: ['Audio'] },
  { name: 'JBL', categories: ['Audio', 'Wearables'] },
  { name: 'Canon', categories: ['Cameras'] },
  { name: 'Nikon', categories: ['Cameras'] },
  { name: 'Fujifilm', categories: ['Cameras'] },
  { name: 'GoPro', categories: ['Cameras', 'Wearables'] },
  { name: 'Garmin', categories: ['Wearables'] },
  { name: 'Fitbit', categories: ['Wearables'] },
  { name: 'Logitech', categories: ['Computers'] },
  { name: 'Razer', categories: ['Computers'] },
  { name: 'Dell', categories: ['Computers'] },
  { name: 'HP', categories: ['Computers'] },
  { name: 'Lenovo', categories: ['Computers'] },
  { name: 'Asus', categories: ['Computers'] },
  { name: 'Acer', categories: ['Computers'] },
  { name: 'MSI', categories: ['Computers'] },
  { name: 'Microsoft', categories: ['Computers', 'Phones & Tablets'] },
  { name: 'Google', categories: ['Phones & Tablets', 'Computers', 'Wearables'] },
  { name: 'Xiaomi', categories: ['Phones & Tablets', 'Appliances', 'Wearables'] },
  { name: 'Huawei', categories: ['Phones & Tablets', 'Wearables'] },
  { name: 'Oppo', categories: ['Phones & Tablets'] },
  { name: 'Vivo', categories: ['Phones & Tablets'] },
  { name: 'OnePlus', categories: ['Phones & Tablets'] },
  { name: 'Nintendo' },
];

export const RETAILERS: string[] = [
  'Challenger',
  'Courts',
  'Harvey Norman',
  'Best Denki',
  'Gain City',
  'Audio House',
  'Parisilk',
  'Apple Store',
  'iStudio',
  'Samsung Experience Store',
  'Sony Store',
  'Epicentre',
  'Sprint-Cass',
  'Mustafa Centre',
  'Takashimaya',
  'Tangs',
  'Amazon.sg',
  'Lazada',
  'Shopee',
  'Qoo10',
  'Best Buy',
  'Walmart',
  'Costco',
];
