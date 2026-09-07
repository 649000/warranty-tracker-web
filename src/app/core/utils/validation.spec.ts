import { describe, expect, it } from 'vitest';
import {
  customMonthsError,
  expiryNotBeforePurchase,
  filterBrands,
  filterRetailers,
  optionalEmailError,
  optionalUrlError,
  priceError,
} from './validation';

describe('priceError', () => {
  it('treats null as empty (no price)', () => {
    expect(priceError(null)).toBeUndefined();
  });

  it('rejects zero and negative prices', () => {
    expect(priceError(0)).toEqual({
      kind: 'priceNegative',
      message: 'Price Must Be Greater Than Zero',
    });
    expect(priceError(-5)?.kind).toBe('priceNegative');
  });

  it('rejects more than 2 decimal places', () => {
    expect(priceError(0.00099)?.kind).toBe('priceDecimals');
    expect(priceError(1.999)?.kind).toBe('priceDecimals');
  });

  it('rejects prices above the maximum', () => {
    expect(priceError(1_000_001)?.kind).toBe('priceTooHigh');
  });

  it('rejects non-finite values', () => {
    expect(priceError(Number.NaN)?.kind).toBe('priceInvalid');
    expect(priceError(Number.POSITIVE_INFINITY)?.kind).toBe('priceInvalid');
  });

  it('accepts valid prices', () => {
    expect(priceError(1)).toBeUndefined();
    expect(priceError(0.01)).toBeUndefined();
    expect(priceError(999_999.99)).toBeUndefined();
  });
});

describe('customMonthsError', () => {
  it('treats null as unset and flags it required', () => {
    expect(customMonthsError(null)).toEqual({
      kind: 'required',
      message: 'Enter the Number of Months',
    });
  });

  it('rejects non-integer values', () => {
    expect(customMonthsError(2.5)?.kind).toBe('customMonthsInteger');
  });

  it('rejects values below 1', () => {
    expect(customMonthsError(-1)?.kind).toBe('customMonthsMin');
  });

  it('rejects values above 240', () => {
    expect(customMonthsError(241)?.kind).toBe('customMonthsMax');
  });

  it('accepts whole months within range', () => {
    expect(customMonthsError(12)).toBeUndefined();
    expect(customMonthsError(240)).toBeUndefined();
  });
});

describe('optionalEmailError', () => {
  it('allows an empty value', () => {
    expect(optionalEmailError('')).toBeUndefined();
    expect(optionalEmailError('   ')).toBeUndefined();
  });

  it('accepts a valid email', () => {
    expect(optionalEmailError('support@sony.com.sg')).toBeUndefined();
  });

  it('rejects an invalid email', () => {
    expect(optionalEmailError('not-an-email')).toEqual({
      kind: 'email',
      message: 'Enter a Valid Email',
    });
    expect(optionalEmailError('a@b')?.kind).toBe('email');
  });
});

describe('optionalUrlError', () => {
  it('allows an empty value', () => {
    expect(optionalUrlError('')).toBeUndefined();
  });

  it('accepts a valid http(s) URL', () => {
    expect(optionalUrlError('https://support.apple.com')).toBeUndefined();
    expect(optionalUrlError('http://example.com')).toBeUndefined();
  });

  it('rejects a URL without a scheme', () => {
    expect(optionalUrlError('apple.com')).toEqual({
      kind: 'url',
      message: 'Enter a Valid URL Including https://',
    });
  });

  it('rejects a non-http scheme', () => {
    expect(optionalUrlError('ftp://example.com')?.kind).toBe('url');
  });
});

describe('expiryNotBeforePurchase', () => {
  it('rejects an expiry before the purchase date', () => {
    expect(expiryNotBeforePurchase(new Date(2024, 0, 1), new Date(2024, 5, 1))?.kind).toBe(
      'expiryBeforePurchase',
    );
  });

  it('accepts an expiry equal to the purchase date', () => {
    const date = new Date(2024, 5, 1);
    expect(expiryNotBeforePurchase(date, new Date(date.getTime()))).toBeUndefined();
  });

  it('accepts an expiry after the purchase date', () => {
    expect(expiryNotBeforePurchase(new Date(2026, 0, 1), new Date(2024, 0, 1))).toBeUndefined();
  });
});

describe('filterBrands', () => {
  it('returns no results for an empty query', () => {
    expect(filterBrands('', 'Phones & Tablets')).toEqual([]);
    expect(filterBrands('   ', '')).toEqual([]);
  });

  it('matches brands by case-insensitive substring', () => {
    const results = filterBrands('sams', '');
    expect(results).toContain('Samsung');
  });

  it('ranks prefix matches before substring matches', () => {
    const results = filterBrands('son', '');
    expect(results.indexOf('Sony')).toBeLessThan(results.indexOf('Panasonic'));
  });

  it('ranks category-affiliated brands above non-affiliated prefix matches', () => {
    // Asus contains 's' and belongs to Computers; Samsung/Sony are prefix
    // matches but not Computer brands. Category affinity must win.
    const results = filterBrands('s', 'Computers');
    expect(results.indexOf('Asus')).toBeGreaterThanOrEqual(0);
    expect(results.indexOf('Samsung')).toBeGreaterThanOrEqual(0);
    expect(results.indexOf('Asus')).toBeLessThan(results.indexOf('Samsung'));
  });

  it('limits results', () => {
    expect(filterBrands('a', '').length).toBeLessThanOrEqual(20);
  });
});

describe('filterRetailers', () => {
  it('returns no results for an empty query', () => {
    expect(filterRetailers('')).toEqual([]);
  });

  it('matches retailers by substring', () => {
    expect(filterRetailers('challenger')).toContain('Challenger');
    expect(filterRetailers('courts')).toContain('Courts');
  });

  it('ranks prefix matches first', () => {
    const results = filterRetailers('cour');
    expect(results[0]).toBe('Courts');
  });

  it('limits results', () => {
    expect(filterRetailers('a').length).toBeLessThanOrEqual(20);
  });
});
