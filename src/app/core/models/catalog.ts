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
