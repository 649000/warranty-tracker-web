import type { CoverageSource } from '../models/warranty.model';

/** Normalizes a brand or retailer name for directory lookup. */
export function normalizeClaimKey(value: string): string {
  return value.trim().toLowerCase();
}

/** Builds the directory document id for a source type and canonical name. */
export function claimContactDocId(type: CoverageSource, name: string): string {
  return `${type}_${normalizeClaimKey(name)}`;
}
