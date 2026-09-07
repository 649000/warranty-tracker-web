import { BRANDS, OTHER_CATEGORY, RETAILERS, type ProductCategory } from '../models/catalog';

export interface FieldError {
  kind: string;
  message: string;
}

export const MAX_PRICE = 1_000_000;
export const MAX_CUSTOM_MONTHS = 240;
export const AUTOCOMPLETE_LIMIT = 20;

/**
 * Validates an optional price. A `null` value means "no price" and is valid.
 * Any numeric value must be positive, have at most two decimal places, and not
 * exceed MAX_PRICE.
 */
export function priceError(amount: number | null): FieldError | undefined {
  if (amount === null) {
    return undefined;
  }
  if (!Number.isFinite(amount)) {
    return { kind: 'priceInvalid', message: 'Enter a Valid Price' };
  }
  if (amount <= 0) {
    return { kind: 'priceNegative', message: 'Price Must Be Greater Than Zero' };
  }
  if (amount > MAX_PRICE) {
    return { kind: 'priceTooHigh', message: 'Price Is Too High' };
  }
  const decimal = String(amount).split('.')[1];
  if (decimal && decimal.length > 2) {
    return { kind: 'priceDecimals', message: 'Price Can Have at Most 2 Decimal Places' };
  }
  return undefined;
}

/**
 * Validates a custom coverage duration in months. Only meaningful when the
 * user has selected the Custom duration; a `null` value means it is unset.
 */
export function customMonthsError(value: number | null): FieldError | undefined {
  if (value === null) {
    return { kind: 'required', message: 'Enter the Number of Months' };
  }
  if (!Number.isInteger(value)) {
    return { kind: 'customMonthsInteger', message: 'Months Must Be a Whole Number' };
  }
  if (value < 1) {
    return { kind: 'customMonthsMin', message: 'Enter a Positive Number of Months' };
  }
  if (value > MAX_CUSTOM_MONTHS) {
    return { kind: 'customMonthsMax', message: 'Enter at Most 240 Months' };
  }
  return undefined;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates an email address only when one is provided (empty is allowed).
 */
export function optionalEmailError(email: string): FieldError | undefined {
  const value = email.trim();
  if (!value) {
    return undefined;
  }
  if (!EMAIL_PATTERN.test(value)) {
    return { kind: 'email', message: 'Enter a Valid Email' };
  }
  return undefined;
}

const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

/**
 * Validates a URL only when one is provided (empty is allowed).
 */
export function optionalUrlError(url: string): FieldError | undefined {
  const value = url.trim();
  if (!value) {
    return undefined;
  }
  if (!URL_PATTERN.test(value)) {
    return { kind: 'url', message: 'Enter a Valid URL Including https://' };
  }
  return undefined;
}

/**
 * Flags a manual expiry date that precedes the purchase/start date.
 */
export function expiryNotBeforePurchase(expiry: Date, purchase: Date): FieldError | undefined {
  if (expiry.getTime() < purchase.getTime()) {
    return {
      kind: 'expiryBeforePurchase',
      message: 'Expiry Date Cannot Be Before the Purchase Date',
    };
  }
  return undefined;
}

interface RankedOption {
  name: string;
  categoryMatch: boolean;
  prefix: boolean;
}

function rankOptions(
  names: readonly string[],
  query: string,
  categoryMatch: (name: string) => boolean,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  const ranked: RankedOption[] = [];
  for (const name of names) {
    const lower = name.toLowerCase();
    if (!lower.includes(q)) {
      continue;
    }
    ranked.push({
      name,
      categoryMatch: categoryMatch(name),
      prefix: lower.startsWith(q),
    });
  }
  ranked.sort(
    (a, b) =>
      Number(b.categoryMatch) - Number(a.categoryMatch) ||
      Number(b.prefix) - Number(a.prefix) ||
      a.name.localeCompare(b.name),
  );
  return ranked.slice(0, AUTOCOMPLETE_LIMIT).map((option) => option.name);
}

/**
 * Suggests brand names matching `query`, ranked with brands belonging to the
 * selected `category` first, then prefix matches before substring matches.
 */
export function filterBrands(query: string, category: ProductCategory | ''): string[] {
  const brandNames = BRANDS.map((brand) => brand.name);
  const hasCategory = category.length > 0 && category !== OTHER_CATEGORY;
  return rankOptions(brandNames, query, (name) => {
    if (!hasCategory) {
      return false;
    }
    const selected = category as ProductCategory;
    return BRANDS.find((entry) => entry.name === name)?.categories?.includes(selected) ?? false;
  });
}

/**
 * Suggests retailer names matching `query`, prefix matches ranked first.
 */
export function filterRetailers(query: string): string[] {
  return rankOptions(RETAILERS, query, () => false);
}
