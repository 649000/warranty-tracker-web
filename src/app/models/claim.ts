import { Warranty } from './warranty';

export interface Claim {
  id: number;
  claimDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  referenceNumber?: string;
  issueDescription: string;
  resolutionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
  warranty?: Warranty;
}

export interface CreateClaimRequest {
  claimDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  referenceNumber?: string;
  issueDescription: string;
  resolutionDetails?: string;
  warrantyId?: number;
}

export interface UpdateClaimRequest {
  id: number;
  claimDate?: Date;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  referenceNumber?: string;
  issueDescription?: string;
  resolutionDetails?: string;
  warrantyId?: number;
}
