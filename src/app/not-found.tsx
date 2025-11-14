import * as React from 'react';
import type { Metadata } from 'next';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  ArrowBack as ArrowLeftIcon,
  Home as HomeIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';

import { config } from '@/config';
import { paths } from '@/paths';

export const metadata = { title: `Not found | ${config.site.name}` } satisfies Metadata;

export default function NotFound(): React.JSX.Element {
  return (
    <Box component="main" sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
      <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 'md', textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <ShieldIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 2 }}>
            404: Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: 400 }}>
            The page you are looking for doesn't exist in your Warranty Tracker dashboard.
            This might be because:
          </Typography>
          <Stack spacing={2} sx={{ textAlign: 'left', maxWidth: 400 }}>
            <Typography variant="body2" color="text.secondary">
              • You typed the wrong URL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • The page has been moved or deleted
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • You don't have permission to access this page
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • The link you followed is broken
            </Typography>
          </Stack>
        </Box>
        
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
          Here are some helpful links:
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.overview}
            variant="outlined"
            startIcon={<HomeIcon />}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            href="/warranties"
            variant="outlined"
            startIcon={<ShieldIcon />}
          >
            My Warranties
          </Button>
        </Stack>
        
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            href={paths.home}
            variant="contained"
            startIcon={<ArrowLeftIcon />}
          >
            Go back to home
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
