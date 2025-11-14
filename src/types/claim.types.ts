import { Warranty } from './warranty.types';

export interface Claim {
  id: number;
  referenceNumber: string;
  issueDescription: string;
  resolutionDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  warranty: Warranty;
}
