'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as SignOutIcon,
} from '@mui/icons-material';

import { paths } from '@/paths';
import { useAuth } from '@/providers/auth/auth.context';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error', error);
    }
  }, [signOut, router]);

  const displayName = user?.email || 'User';
  const userName = displayName.split('@')[0] || 'User';

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px' }}>
        <Typography variant="subtitle1">{userName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {displayName}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Account
        </MenuItem>
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
