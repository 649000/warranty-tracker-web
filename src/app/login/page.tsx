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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Values) => {
    setIsPending(true);
    try {
      await signIn(values.email, values.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError('root', { type: 'server', message: err.message || 'Failed to sign in' });
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

      {/* Login Form */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Sign in
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Don't have an account?{' '}
                <Link
                  component="button"
                  onClick={() => router.push('/register')}
                  underline="hover"
                  variant="subtitle2"
                  sx={{ p: 0, minWidth: 'auto', minHeight: 'auto', verticalAlign: 'baseline' }}
                >
                  Sign up
                </Link>
              </Typography>
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
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
                        autoComplete="current-password"
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

                <Box sx={{ textAlign: 'left' }}>
                  <Link
                    component="button"
                    onClick={() => router.push('/auth/reset-password')}
                    variant="subtitle2"
                    sx={{ p: 0 }}
                  >
                    Forgot password?
                  </Link>
                </Box>

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
                  {isPending ? 'Signing In...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Track your product warranties seamlessly. Sign in to manage your warranty claims and product information.
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
