'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { dayjs } from '@/lib/dayjs';

export interface Claim {
  id: string;
  referenceNumber: string;
  productName: string;
  serialNumber: string;
  issueDescription: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  createdAt: string;
}

export interface RecentClaimsProps {
  claims: Claim[];
  sx?: SxProps;
}

export function RecentClaims({ claims, sx }: RecentClaimsProps): React.JSX.Element {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'var(--mui-palette-warning-main)';
      case 'APPROVED':
        return 'var(--mui-palette-primary-main)';
      case 'REJECTED':
        return 'var(--mui-palette-error-main)';
      case 'RESOLVED':
        return 'var(--mui-palette-success-main)';
      default:
        return 'var(--mui-palette-grey-main)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon color="var(--mui-palette-warning-main)" />;
      case 'APPROVED':
        return <CheckCircleIcon color="var(--mui-palette-primary-main)" />;
      case 'REJECTED':
        return <XCircleIcon color="var(--mui-palette-error-main)" />;
      case 'RESOLVED':
        return <CheckCircleIcon color="var(--mui-palette-success-main)" />;
      default:
        return <ClipboardTextIcon color="var(--mui-palette-grey-main)" />;
    }
  };

  const getTimeAgo = (createdAt: string): string => {
    const created = dayjs(createdAt);
    const now = dayjs();
    const diffInHours = now.diff(created, 'hour');
    const diffInDays = now.diff(created, 'day');

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return created.format('MMM DD, YYYY');
    }
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Recent Claims" />
      <CardContent>
        <Stack spacing={2}>
          {claims.map((claim) => (
            <Box key={claim.id}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                {getStatusIcon(claim.status)}
                <Box sx={{ flex: '1 1 auto' }}>
                  <Typography variant="subtitle2">{claim.referenceNumber}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {claim.productName}
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {claim.serialNumber}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    {claim.issueDescription.length > 60 
                      ? `${claim.issueDescription.substring(0, 60)}...` 
                      : claim.issueDescription
                    }
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {getTimeAgo(claim.createdAt)}
                  </Typography>
                </Box>
                <Typography color={getStatusColor(claim.status)} variant="subtitle2">
                  {claim.status}
                </Typography>
              </Stack>
              {claim !== claims[claims.length - 1] && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Link color="primary.main" sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }} variant="body2">
          View all claims
        </Link>
      </Box>
    </Card>
  );
}
