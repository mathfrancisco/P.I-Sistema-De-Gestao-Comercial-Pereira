import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'

import * as yup from 'yup'
import { useAuth } from '../../hooks/useAuth'
import { useFormWithValidation } from '../../hooks/useFormExtended'

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória'),
})

type LoginFormData = yup.InferType<typeof loginSchema>

export const Login: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormWithValidation(loginSchema)
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
    } catch {
      setError('Email ou senha inválidos')
    }
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" color="primary">
              Comercial Pereira
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Sistema de Gestão
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              {...register('email')}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password')}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Entrar'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}