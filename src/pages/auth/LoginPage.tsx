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
import { loginSchema, type LoginFormData } from '@/lib/validations/authSchemas'
import {
  signInWithEmail,
  signInWithGoogle,
  getAuthErrorMessage,
} from '@/services/authService'

const LoginPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    try {
      await signInWithEmail(data.email, data.password)
      navigate('/dashboard')
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

  return (
    <Box sx={{ width: '100%' }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Sign In
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back to WealthTracker
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

        <TextField
          {...register('password')}
          margin="normal"
          required
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
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

        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2, py: 1.5 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Sign In'}
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
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
