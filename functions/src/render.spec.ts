import { describe, expect, it } from 'vitest';
import { formatSingaporeDate, renderDigest } from './render.js';

const EXPIRY = new Date('2026-10-09T16:00:00Z');

describe('render', () => {
  const lines = [
    {
      productId: 'prod-1',
      productName: 'Sony Headphones',
      expiry: EXPIRY,
      daysAhead: 7,
    },
    {
      productId: 'prod-2',
      productName: 'Acer <Laptop> & Dock',
      expiry: EXPIRY,
      daysAhead: 0,
    },
  ];

  it('renders a digest with per-product links and remaining time', () => {
    const digest = renderDigest('https://app.example.com', '10 October 2026', lines);
    expect(digest.subject).toContain('10 October 2026');
    expect(digest.html).toContain('href="https://app.example.com/warranties/prod-1"');
    expect(digest.html).toContain('expires in 7 days');
    expect(digest.html).toContain('expires today');
    expect(digest.text).toContain('https://app.example.com/warranties/prod-2');
  });

  it('escapes user-controlled product names in HTML', () => {
    const digest = renderDigest('https://app.example.com', '10 October 2026', lines);
    expect(digest.html).toContain('Acer &lt;Laptop&gt; &amp; Dock');
    expect(digest.html).not.toContain('<Laptop>');
  });

  it('formats dates on the Singapore calendar', () => {
    expect(formatSingaporeDate(EXPIRY)).toBe('10 October 2026');
  });
});
