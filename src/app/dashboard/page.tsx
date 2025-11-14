'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import Grid from '@mui/material/Grid';

import { config } from '@/config';
import { claimApi, useUserClaims } from '@/services/claim.service';
import { warrantyApi, useAllWarranties } from '@/services/warranty.service';
import { userProductApi, useUserProducts } from '@/services/user-product.service';
import { Warranty } from '@/types/warranty.types';
import { Claim } from '@/types/claim.types';
import { UserProduct } from '@/types/user-product.types';
import { ActiveWarranties } from '@/components/dashboard/overview/active-warranties';
import { PendingClaims } from '@/components/dashboard/overview/pending-claims';
import { RegisteredProducts } from '@/components/dashboard/overview/registered-products';
import { WarrantyCoverage } from '@/components/dashboard/overview/warranty-coverage';
import { WarrantyExpiry } from '@/components/dashboard/overview/warranty-expiry';
import { ClaimsStatus } from '@/components/dashboard/overview/claims-status';
import { RecentWarranties } from '@/components/dashboard/overview/recent-warranties';
import { RecentClaims } from '@/components/dashboard/overview/recent-claims';
import { dayjs } from '@/lib/dayjs';

export default function Page(): React.JSX.Element {
  // Fetch warranties using the correct hook
  const { data: warranties = [], isLoading: warrantiesLoading } = useAllWarranties();

  // Fetch claims using the correct hook
  const { data: claims = [], isLoading: claimsLoading } = useUserClaims();

  // Fetch user products using the correct hook
  const { data: userProducts = [], isLoading: productsLoading } = useUserProducts();

  // Get counts for summary cards
  const activeWarranties = warranties.filter((w: Warranty) => w.status === 'ACTIVE').length;
  const pendingClaims = claims.filter((c: Claim) => c.status === 'PENDING').length;
  const registeredProducts = userProducts.length;

  // Prepare data for charts
  const warrantyExpiryData = [
    { name: 'Active Warranties', data: [12, 15, 18, 14, 16, 20, 18, 22, 19, 17, 15, 13] },
    { name: 'Expiring Soon', data: [3, 4, 6, 5, 7, 8, 6, 9, 7, 5, 4, 3] },
  ];

  const claimsStatusData = [
    claims.filter((c: Claim) => c.status === 'PENDING').length,
    claims.filter((c: Claim) => c.status === 'APPROVED').length,
    claims.filter((c: Claim) => c.status === 'REJECTED').length,
    claims.filter((c: Claim) => c.status === 'RESOLVED').length,
  ];

  const claimsStatusLabels = ['Pending', 'Approved', 'Rejected', 'Resolved'];

  // Prepare recent warranties data
  const recentWarrantiesData = warranties.slice(0, 5).map((warranty: Warranty) => ({
    id: warranty.id.toString(),
    productName: warranty.userProduct?.product?.name || 'Unknown Product',
    serialNumber: warranty.userProduct?.serialNumber || 'N/A',
    endDate: warranty.endDate,
    status: warranty.status,
    warrantyPeriod: warranty.warrantyPeriod,
  }));

  // Prepare recent claims data
  const recentClaimsData = claims.slice(0, 5).map((claim: Claim) => ({
    id: claim.id.toString(),
    referenceNumber: claim.referenceNumber,
    productName: claim.warranty?.userProduct?.product?.name || 'Unknown Product',
    serialNumber: claim.warranty?.userProduct?.serialNumber || 'N/A',
    issueDescription: claim.issueDescription,
    status: claim.status,
    createdAt: claim.createdAt,
  }));

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid
        item
        lg={3}
        sm={6}
        xs={12}
      >
        <ActiveWarranties diff={12} trend="up" sx={{ height: '100%' }} value={activeWarranties.toString()} />
      </Grid>
      <Grid
        item
        lg={3}
        sm={6}
        xs={12}
      >
        <PendingClaims diff={8} trend="down" sx={{ height: '100%' }} value={pendingClaims.toString()} />
      </Grid>
      <Grid
        item
        lg={3}
        sm={6}
        xs={12}
      >
        <RegisteredProducts diff={15} trend="up" sx={{ height: '100%' }} value={registeredProducts.toString()} />
      </Grid>
      <Grid
        item
        lg={3}
        sm={6}
        xs={12}
      >
        <WarrantyCoverage 
          diff={5} 
          trend="up" 
          sx={{ height: '100%' }} 
          value={`${Math.round((activeWarranties / (warranties.length || 1)) * 100)}%`}
        />
      </Grid>

      {/* Charts */}
      <Grid
        item
        lg={8}
        xs={12}
      >
        <WarrantyExpiry
          chartSeries={warrantyExpiryData}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid
        item
        lg={4}
        md={6}
        xs={12}
      >
        <ClaimsStatus 
          chartSeries={claimsStatusData} 
          labels={claimsStatusLabels}
          sx={{ height: '100%' }} 
        />
      </Grid>

      {/* Recent Items */}
      <Grid
        item
        lg={4}
        md={6}
        xs={12}
      >
        <RecentWarranties
          warranties={recentWarrantiesData}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid
        item
        lg={8}
        md={12}
        xs={12}
      >
        <RecentClaims
          claims={recentClaimsData}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
