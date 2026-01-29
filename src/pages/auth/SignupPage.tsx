import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
} from '@mui/icons-material'
import { signupSchema, type SignupFormData } from '@/lib/validations/authSchemas'
import {
  signUpWithEmail,
  signInWithGoogle,
  getAuthErrorMessage,
} from '@/services/authService'

const SignupPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setError(null)
    try {
      await signUpWithEmail(data.email, data.password, data.displayName)
      setSuccess(true)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      setError(getAuthErrorMessage(firebaseError.code || ''))
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      setError(getAuthErrorMessage(firebaseError.code || ''))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Check Your Email
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Account created successfully! We've sent a verification email to your inbox.
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please verify your email address to complete registration.
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Go to Sign In
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Create Account
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Start tracking your wealth today
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('displayName')}
          margin="normal"
          required
          fullWidth
          id="displayName"
          label="Full Name"
          autoComplete="name"
          autoFocus
          error={!!errors.displayName}
          helperText={errors.displayName?.message}
          disabled={isSubmitting}
        />

        <TextField
          {...register('email')}
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isSubmitting}
        />

        <TextField
          {...register('password')}
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isSubmitting}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('confirmPassword')}
          margin="normal"
          required
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          id="confirmPassword"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          disabled={isSubmitting}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={isGoogleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleLoading}
          sx={{ py: 1.5 }}
        >
          Continue with Google
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SignupPage
