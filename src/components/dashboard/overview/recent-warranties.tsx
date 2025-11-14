'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { dayjs } from '@/lib/dayjs';

export interface Warranty {
  id: string;
  productName: string;
  serialNumber: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  warrantyPeriod: number;
}

export interface RecentWarrantiesProps {
  warranties: Warranty[];
  sx?: SxProps;
}

export function RecentWarranties({ warranties, sx }: RecentWarrantiesProps): React.JSX.Element {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'var(--mui-palette-success-main)';
      case 'EXPIRED':
        return 'var(--mui-palette-error-main)';
      case 'CANCELLED':
        return 'var(--mui-palette-warning-main)';
      default:
        return 'var(--mui-palette-grey-main)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <ShieldCheckIcon color="var(--mui-palette-success-main)" />;
      case 'EXPIRED':
        return <XCircleIcon color="var(--mui-palette-error-main)" />;
      case 'CANCELLED':
        return <ClockIcon color="var(--mui-palette-warning-main)" />;
      default:
        return <ClockIcon color="var(--mui-palette-grey-main)" />;
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = dayjs(endDate);
    const now = dayjs();
    return end.diff(now, 'day');
  };

  const getProgressValue = (endDate: string, warrantyPeriod: number): number => {
    const end = dayjs(endDate);
    const start = end.subtract(warrantyPeriod, 'day');
    const now = dayjs();
    const totalDays = warrantyPeriod;
    const daysElapsed = now.diff(start, 'day');
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Recent Warranties" />
      <CardContent>
        <Stack spacing={2}>
          {warranties.map((warranty) => {
            const daysRemaining = getDaysRemaining(warranty.endDate);
            const progressValue = getProgressValue(warranty.endDate, warranty.warrantyPeriod);
            
            return (
              <Box key={warranty.id}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  {getStatusIcon(warranty.status)}
                  <Box sx={{ flex: '1 1 auto' }}>
                    <Typography variant="subtitle2">{warranty.productName}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {warranty.serialNumber}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {warranty.status === 'ACTIVE' 
                        ? `${daysRemaining} days remaining`
                        : `Ended ${Math.abs(daysRemaining)} days ago`
                      }
                    </Typography>
                  </Box>
                  <Typography color={getStatusColor(warranty.status)} variant="subtitle2">
                    {warranty.status}
                  </Typography>
                </Stack>
                {warranty.status === 'ACTIVE' && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      value={progressValue} 
                      variant="determinate" 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: 'var(--mui-palette-grey-200)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                        }
                      }} 
                    />
                  </Box>
                )}
                {warranty !== warranties[warranties.length - 1] && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Link color="primary.main" sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }} variant="body2">
          View all warranties
        </Link>
      </Box>
    </Card>
  );
}
