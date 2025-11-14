'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth/auth.context';
import {
  AppBar,
  Button,
  Container,
  TextField,
  Toolbar,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
  Stack,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password should be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  terms: z.boolean().refine((value) => value, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

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
      email: '', 
      password: '', 
      confirmPassword: '',
      terms: false 
    },
  });

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      await signUp(values.email, values.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError('root', { type: 'server', message: err.message || 'Failed to create account' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Warranty Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Register Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Sign up
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Already have an account?{' '}
                <Link
                  component="button"
                  onClick={() => router.push('/login')}
                  underline="hover"
                  variant="subtitle2"
                  sx={{ p: 0, minWidth: 'auto', minHeight: 'auto', verticalAlign: 'baseline' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {/* Name Fields Row */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.firstName)} sx={{ flex: 1 }}>
                        <TextField
                          {...field}
                          label="First name"
                          error={Boolean(errors.firstName)}
                          helperText={errors.firstName?.message}
                          variant="outlined"
                          fullWidth
                        />
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.lastName)} sx={{ flex: 1 }}>
                        <TextField
                          {...field}
                          label="Last name"
                          error={Boolean(errors.lastName)}
                          helperText={errors.lastName?.message}
                          variant="outlined"
                          fullWidth
                        />
                      </FormControl>
                    )}
                  />
                </Stack>

                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.email)}>
                      <TextField
                        {...field}
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        error={Boolean(errors.email)}
                        helperText={errors.email?.message}
                        variant="outlined"
                        fullWidth
                      />
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.password)}>
                      <TextField
                        {...field}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        error={Boolean(errors.password)}
                        helperText={errors.password?.message}
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                aria-label="toggle password visibility"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.confirmPassword)}>
                      <TextField
                        {...field}
                        label="Confirm password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword?.message}
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                aria-label="toggle confirm password visibility"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  )}
                />

                <Controller
                  control={control}
                  name="terms"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.terms)}>
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label={
                          <Typography variant="body2">
                            I have read the{' '}
                            <Link
                              component="button"
                              onClick={() => router.push('/terms')}
                              underline="hover"
                              variant="body2"
                            >
                              terms and conditions
                            </Link>
                          </Typography>
                        }
                      />
                      {errors.terms && (
                        <FormHelperText error>{errors.terms.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {errors.root && (
                  <Alert severity="error">
                    {errors.root.message}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isPending}
                  startIcon={isPending ? <CircularProgress size={20} /> : null}
                  sx={{ mt: 2 }}
                >
                  {isPending ? 'Creating account...' : 'Sign up'}
                </Button>
              </Stack>
            </form>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Join Warranty Tracker to manage all your product warranties in one place. Get reminders for expiring warranties and track claims easily.
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
