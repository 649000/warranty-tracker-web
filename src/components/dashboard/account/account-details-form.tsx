'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useAuth } from '@/providers/auth/auth.context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  warrantyReminders: z.boolean(),
  expirationAlerts: z.boolean(),
});

type Values = z.infer<typeof schema>;

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'other', label: 'Other' },
] as const;

const states = [
  { value: 'al', label: 'Alabama' },
  { value: 'ca', label: 'California' },
  { value: 'fl', label: 'Florida' },
  { value: 'ny', label: 'New York' },
  { value: 'tx', label: 'Texas' },
  { value: 'wa', label: 'Washington' },
  { value: 'other', label: 'Other' },
] as const;

export function AccountDetailsForm(): React.JSX.Element {
  const { user } = useAuth();
  const [isPending, setIsPending] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      company: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'us',
      emailNotifications: true,
      smsNotifications: false,
      warrantyReminders: true,
      expirationAlerts: true,
    },
  });

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      // TODO: Implement user profile update API call
      console.log('Updating user profile:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      setError('root', { type: 'server', message: err.message || 'Failed to update profile' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader subheader="Update your personal information and preferences" title="Profile Information" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <FormControl fullWidth required error={Boolean(errors.firstName)}>
                    <InputLabel>First name</InputLabel>
                    <OutlinedInput {...field} label="First name" />
                    {errors.firstName && (
                      <Typography variant="caption" color="error">
                        {errors.firstName.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <FormControl fullWidth required error={Boolean(errors.lastName)}>
                    <InputLabel>Last name</InputLabel>
                    <OutlinedInput {...field} label="Last name" />
                    {errors.lastName && (
                      <Typography variant="caption" color="error">
                        {errors.lastName.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl fullWidth required error={Boolean(errors.email)}>
                    <InputLabel>Email address</InputLabel>
                    <OutlinedInput {...field} label="Email address" type="email" />
                    {errors.email && (
                      <Typography variant="caption" color="error">
                        {errors.email.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Phone number</InputLabel>
                    <OutlinedInput {...field} label="Phone number" name="phone" type="tel" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="company"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Company (Optional)</InputLabel>
                    <OutlinedInput {...field} label="Company" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select {...field} label="Country" variant="outlined">
                      {countries.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Street address</InputLabel>
                    <OutlinedInput {...field} label="Street address" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <OutlinedInput {...field} label="City" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={4} xs={6}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>State/Province</InputLabel>
                    <Select {...field} label="State" variant="outlined">
                      {states.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={2} xs={6}>
              <Controller
                control={control}
                name="zipCode"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>ZIP/Postal</InputLabel>
                    <OutlinedInput {...field} label="ZIP/Postal" />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardHeader subheader="Manage your notification preferences" title="Notification Settings" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Controller
                control={control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Email notifications for warranty updates"
                  />
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="smsNotifications"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="SMS notifications for urgent updates"
                  />
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="warrantyReminders"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Warranty expiration reminders (30 days before)"
                  />
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                control={control}
                name="expirationAlerts"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Critical expiration alerts (7 days before)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="error">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
