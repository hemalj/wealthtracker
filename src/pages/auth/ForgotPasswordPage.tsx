import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import {
  passwordResetSchema,
  type PasswordResetFormData,
} from '@/lib/validations/authSchemas'
import { resetPassword, getAuthErrorMessage } from '@/services/authService'

const ForgotPasswordPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: PasswordResetFormData) => {
    setError(null)
    try {
      await resetPassword(data.email)
      setSuccess(true)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      setError(getAuthErrorMessage(firebaseError.code || ''))
    }
  }

  if (success) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Check Your Email
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Password reset email sent successfully!
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We've sent a password reset link to <strong>{getValues('email')}</strong>.
          Please check your inbox and follow the instructions.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Didn't receive the email? Check your spam folder or try again.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setSuccess(false)}
          >
            Try Again
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
          >
            Back to Sign In
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Link
        component={RouterLink}
        to="/login"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          mb: 3,
          color: 'text.secondary',
          textDecoration: 'none',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <ArrowBackIcon sx={{ mr: 0.5, fontSize: 20 }} />
        Back to Sign In
      </Link>

      <Typography component="h1" variant="h4" gutterBottom>
        Forgot Password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        No worries! Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('email')}
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>
      </Box>
    </Box>
  )
}

export default ForgotPasswordPage
