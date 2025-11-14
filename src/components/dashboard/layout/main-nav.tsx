'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as BellIcon,
} from '@mui/icons-material';

import { usePopover } from '@/hooks/use-popover';
import { useAuth } from '@/providers/auth/auth.context';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user } = useAuth();
  const userPopover = usePopover<HTMLDivElement>();

  const userInitials = user?.email
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'U';

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title="Search">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notifications">
              <Badge badgeContent={0} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ 
                cursor: 'pointer',
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              {userInitials}
            </Avatar>
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
