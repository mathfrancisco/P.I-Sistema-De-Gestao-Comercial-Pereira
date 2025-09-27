import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import type { UserRole } from '../../types/enums'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, canAccess } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (roles && !canAccess(roles)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h5" color="error">
          Acesso Negado
        </Typography>
      </Box>
    )
  }
  
  return <>{children}</>
}