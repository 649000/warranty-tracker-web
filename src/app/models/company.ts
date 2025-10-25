import { Warranty } from './warranty';

export interface Company {
  id: number;
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  claimProcess?: string;
  claimUrl?: string;
  supportHours?: string;
  returnInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  warranties?: Warranty[];
}

export interface CreateCompanyRequest {
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  claimProcess?: string;
  claimUrl?: string;
  supportHours?: string;
  returnInstructions?: string;
}

export interface UpdateCompanyRequest {
  id: number;
  name?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  claimProcess?: string;
  claimUrl?: string;
  supportHours?: string;
  returnInstructions?: string;
}
