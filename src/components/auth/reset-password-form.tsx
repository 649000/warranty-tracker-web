'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authService } from '@/services/auth.service';

const schema = zod.object({ 
  email: zod.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' })
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setError('');
      setFormError('root', { message: '' });

      try {
        // For Firebase, we would typically send a password reset email
        // This is a placeholder implementation
        await authService.sendPasswordResetEmail(values.email);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email. Please try again.');
        setFormError('root', { type: 'server', message: err.message || 'Failed to send reset email' });
      } finally {
        setIsPending(false);
      }
    },
    [setError, setFormError]
  );

  if (isSuccess) {
    return (
      <Stack spacing={4} sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Password reset email sent! Check your inbox for further instructions.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Didn't receive the email?{' '}
          <Button 
            variant="text" 
            size="small"
            onClick={() => setIsSuccess(false)}
            sx={{ p: 0, minHeight: 'auto', minWidth: 'auto' }}
          >
            Try again
          </Button>
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4} sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Reset password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput 
                  {...field} 
                  label="Email address" 
                  type="email" 
                  autoComplete="email"
                  fullWidth
                />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={isPending}
            startIcon={isPending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-2 border-t-blue-500" /> : null}
          >
            {isPending ? 'Sending...' : 'Send reset link'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
