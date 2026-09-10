import type { CoverageSource } from './warranty.model';

export type ClaimContactType = CoverageSource;

export interface ClaimContact {
  type: ClaimContactType;
  name: string;
  matchKeys: string[];
  url?: string;
  hotline?: string;
  email?: string;
  claimSteps?: string[];
  serviceCenterUrl?: string;
  registrationUrl?: string;
  updatedAt?: Date;
}
