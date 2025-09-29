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
    Checkbox,
    FormControlLabel,
    Link,
} from '@mui/material'
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
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
    const [rememberMe, setRememberMe] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useFormWithValidation(loginSchema)

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null)
            // PASSA O REMEMBER ME PARA O LOGIN
            await login(data.email, data.password, rememberMe)
        } catch (err: any) {
            // O erro já foi mostrado pelo toast no useAuth
            // Mas mantém no estado local também para exibir no Alert
            const errorMessage = err?.response?.data?.message || 'Email ou senha inválidos'
            setError(errorMessage)
        }
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
                    pointerEvents: 'none',
                }
            }}
        >
            <Container component="main" maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        borderRadius: '24px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 80px rgba(59, 130, 246, 0.25)',
                        minHeight: '700px',
                    }}
                >
                    {/* Left Side - Login Form */}
                    <Box
                        sx={{
                            flex: 1,
                            padding: { xs: 4, md: 6 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            maxWidth: { md: '500px' },
                            backgroundColor: 'white',
                        }}
                    >
                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    CP
                                </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
                                Comercial Pereira
                            </Typography>
                        </Box>

                        {/* Header */}
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#1E293B',
                                    mb: 2,
                                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Entrar
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>
                                Sistema de Gestão Comercial
                            </Typography>
                        </Box>

                        {/* Google Sign In Button */}
                        <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            sx={{
                                mb: 4,
                                py: 1.8,
                                borderColor: '#E3F2FD',
                                color: '#64748B',
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                opacity: 0.6,
                                '&:hover': {
                                    borderColor: '#93C5FD',
                                    backgroundColor: '#F8FAFC',
                                },
                            }}
                        >
                            <GoogleIcon sx={{ color: '#3B82F6' }} />
                            Entrar com Google (em breve)
                        </Button>

                        {/* Divider */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E3F2FD' }} />
                            <Typography sx={{ px: 3, color: '#94A3B8', fontSize: '14px', fontWeight: 500 }}>
                                Ou
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E3F2FD' }} />
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                onClose={() => setError(null)}
                                sx={{
                                    mb: 3,
                                    borderRadius: '16px',
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#991B1B',
                                    '& .MuiAlert-icon': {
                                        color: '#DC2626'
                                    }
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            {/* Email Field */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#1E293B' }}>
                                    Email
                                </Typography>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    placeholder="seuemail@exemplo.com"
                                    autoComplete="email"
                                    autoFocus
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            backgroundColor: '#F8FAFC',
                                            fontSize: '16px',
                                            '& fieldset': {
                                                borderColor: '#E3F2FD',
                                                borderWidth: '1px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#93C5FD',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3B82F6',
                                                borderWidth: '2px',
                                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                            },
                                            '& input': {
                                                py: 1.8,
                                                color: '#1E293B',
                                                fontWeight: 500,
                                            }
                                        },
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: '#60A5FA', fontSize: '20px' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    {...register('email')}
                                />
                            </Box>

                            {/* Password Field */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#1E293B' }}>
                                    Senha
                                </Typography>
                                <TextField
                                    required
                                    fullWidth
                                    placeholder="Digite sua senha"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            backgroundColor: '#F8FAFC',
                                            fontSize: '16px',
                                            '& fieldset': {
                                                borderColor: '#E3F2FD',
                                                borderWidth: '1px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#93C5FD',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3B82F6',
                                                borderWidth: '2px',
                                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                                            },
                                            '& input': {
                                                py: 1.8,
                                                color: '#1E293B',
                                                fontWeight: 500,
                                            }
                                        },
                                        '& .MuiFormHelperText-root': {
                                            marginLeft: 0,
                                            fontSize: '14px',
                                            fontWeight: 500,
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: '#60A5FA', fontSize: '20px' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    sx={{ color: '#94A3B8' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    {...register('password')}
                                />
                            </Box>

                            {/* Remember Me & Forgot Password */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{
                                                color: '#94A3B8',
                                                '&.Mui-checked': {
                                                    color: '#3B82F6',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                                            Lembrar-me por 30 dias
                                        </Typography>
                                    }
                                />
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => e.preventDefault()}
                                    sx={{
                                        color: '#3B82F6',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Esqueceu a senha?
                                </Link>
                            </Box>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting || loading}
                                sx={{
                                    py: 2,
                                    mb: 4,
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                                        boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:disabled': {
                                        background: '#E5E7EB',
                                        boxShadow: 'none',
                                        transform: 'none',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                {isSubmitting || loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Entrar'
                                )}
                            </Button>

                            {/* Sign Up Link */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    Não tem uma conta?{' '}
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        sx={{
                                            color: '#3B82F6',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Cadastre-se
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Side - Dashboard Preview */}
                    <Box
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                            display: { xs: 'none', md: 'flex' },
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            position: 'relative',
                            p: 6,
                            minWidth: '500px',
                        }}
                    >
                        {/* Background Geometric Shapes */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '10%',
                                right: '10%',
                                width: '120px',
                                height: '120px',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                transform: 'rotate(45deg)',
                                backdropFilter: 'blur(10px)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '15%',
                                left: '15%',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '60%',
                                right: '20%',
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                transform: 'rotate(30deg)',
                                backdropFilter: 'blur(10px)',
                            }}
                        />

                        {/* Content */}
                        <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: '400px' }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3, lineHeight: 1.2 }}>
                                Sistema de Gestão Completo para Seu Negócio
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.5 }}>
                                Simplifique tarefas complexas, acompanhe métricas importantes
                                e tome decisões inteligentes sem esforço
                            </Typography>

                            {/* Feature Cards */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
                                {[
                                    {
                                        icon: '📊',
                                        title: 'Dashboard Intuitivo',
                                        desc: 'Visualize todas as métricas importantes em tempo real'
                                    },
                                    {
                                        icon: '💼',
                                        title: 'Gestão Integrada',
                                        desc: 'Controle vendas, estoque e clientes em um só lugar'
                                    },
                                    {
                                        icon: '📈',
                                        title: 'Relatórios Inteligentes',
                                        desc: 'Insights avançados para impulsionar seu crescimento'
                                    },
                                ].map((feature, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '16px',
                                            p: 3,
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateX(5px)',
                                            }
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ mr: 3, minWidth: '50px' }}>
                                            {feature.icon}
                                        </Typography>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.4 }}>
                                                {feature.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* Progress Indicator */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                                {[0, 1, 2].map((dot, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: index === 1 ? 32 : 12,
                                            height: 12,
                                            borderRadius: '6px',
                                            backgroundColor: index === 1 ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}