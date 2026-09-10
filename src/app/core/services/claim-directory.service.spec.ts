import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DB } from '../firebase/firebase.providers';
import type { ClaimContact } from '../models/claim-contact.model';
import {
  ClaimDirectoryService,
  claimContactDocId,
  normalizeClaimKey,
} from './claim-directory.service';

const APPLE: ClaimContact = {
  type: 'manufacturer',
  name: 'Apple',
  matchKeys: ['apple', 'apple inc'],
  url: 'https://support.apple.com',
  hotline: '+65 1800 123 4567',
  email: 'support@apple.com',
  claimSteps: ['Find your serial number', 'Book a service appointment'],
  serviceCenterUrl: 'https://support.apple.com/service',
  registrationUrl: 'https://support.apple.com/register',
};

const CHALLENGER: ClaimContact = {
  type: 'retailer',
  name: 'Challenger',
  matchKeys: ['challenger'],
  url: 'https://www.challenger.com.sg',
};

function setup(entries: ClaimContact[] = [APPLE, CHALLENGER]) {
  TestBed.configureTestingModule({ providers: [{ provide: DB, useValue: {} }] });
  const service = TestBed.inject(ClaimDirectoryService);
  service.entries.set(entries);
  return service;
}

describe('ClaimDirectoryService', () => {
  it('normalizes keys by trimming and lowercasing', () => {
    expect(normalizeClaimKey('  Apple Inc  ')).toBe('apple inc');
  });

  it('builds a {type}_{name} document id', () => {
    expect(claimContactDocId('retailer', 'Harvey Norman')).toBe('retailer_harvey norman');
  });

  it('resolves a manufacturer coverage by brand', () => {
    const service = setup();
    expect(service.findEntry('manufacturer', 'Apple', undefined)?.name).toBe('Apple');
  });

  it('resolves a retailer coverage by retailer', () => {
    const service = setup();
    expect(service.findEntry('retailer', undefined, 'Challenger')?.name).toBe('Challenger');
  });

  it('matches an alias case-insensitively and ignoring whitespace', () => {
    const service = setup();
    expect(service.findEntry('manufacturer', '  apple inc ', undefined)?.name).toBe('Apple');
  });

  it('returns no entry when nothing matches', () => {
    const service = setup();
    expect(service.findEntry('manufacturer', 'Unbranded', undefined)).toBeUndefined();
  });

  it('returns no entry when the lookup name is missing', () => {
    const service = setup();
    expect(service.findEntry('retailer', 'Apple', undefined)).toBeUndefined();
  });

  it('reports a user override when the coverage has contact info', () => {
    const service = setup();
    const result = service.resolve('manufacturer', 'Apple', undefined, { hotline: '123' });
    expect(result.status).toBe('user');
    expect(result.userContact).toEqual({ hotline: '123' });
  });

  it('reports suggested when the directory matches and there is no override', () => {
    const service = setup();
    const result = service.resolve('manufacturer', 'Apple', undefined, undefined);
    expect(result.status).toBe('suggested');
    expect(result.entry?.name).toBe('Apple');
  });

  it('reports none when nothing matches and there is no override', () => {
    const service = setup();
    const result = service.resolve('manufacturer', 'Unbranded', undefined, undefined);
    expect(result.status).toBe('none');
  });

  it('keeps the matched entry available when the user overrides', () => {
    const service = setup();
    const result = service.resolve('manufacturer', 'Apple', undefined, {
      email: 'me@example.com',
    });
    expect(result.status).toBe('user');
    expect(result.entry?.name).toBe('Apple');
  });
});
