import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/providers/auth/auth.context';

export function AccountInfo(): React.JSX.Element {
  const { user } = useAuth();

  const userInitials = user?.email
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'U';

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'Unknown';

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar
              sx={{ height: '80px', width: '80px', fontSize: '2rem', bgcolor: 'primary.main' }}
            >
              {userInitials}
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.email || 'User'}</Typography>
            <Typography color="text.secondary" variant="body2">
              Warranty Tracker Member
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Member since {memberSince}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Account Summary</Typography>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="body2">
              📦 Total Products: <strong>12</strong>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              🛡️ Active Warranties: <strong>8</strong>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              📋 Pending Claims: <strong>2</strong>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              ⏰ Expiring Soon: <strong>3</strong>
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
}
