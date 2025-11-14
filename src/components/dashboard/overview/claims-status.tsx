'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface ClaimsStatusProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function ClaimsStatus({ chartSeries, labels, sx }: ClaimsStatusProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Claims Status Distribution"
      />
      <CardContent>
        <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small">
          View All
        </Button>
      </CardActions>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [
      theme.palette.warning.main,  // Pending
      theme.palette.primary.main,  // Approved
      theme.palette.error.main,    // Rejected
      theme.palette.success.main,  // Resolved
    ],
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    fill: { opacity: 1, type: 'solid' },
    labels: labels,
    legend: {
      floating: false,
      formatter: function legendFormatter(seriesName, opts) {
        return `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`;
      },
      position: 'bottom',
    },
    plotOptions: {
      pie: { expandOnClick: false },
    },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: function (value) {
          return `${value} claims`;
        },
      },
    },
  };
}
