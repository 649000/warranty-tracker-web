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
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
  { label: '3 years', months: 36 },
  { label: '5 years', months: 60 },
  { label: 'Lifetime', lifetime: true },
];

export const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'JPY', 'MYR', 'CNY'] as const;
