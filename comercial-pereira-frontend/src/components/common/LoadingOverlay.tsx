import React from 'react'
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material'

interface LoadingOverlayProps {
  open: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Carregando...',
}) => {
  return (
    <Backdrop
      sx={{
        background: 'rgba(30, 58, 138, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
        sx={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: 4,
          boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)',
        }}
      >
        <CircularProgress 
          size={48}
          sx={{
            color: '#3B82F6',
          }}
        />
        <Typography 
          variant="h6"
          sx={{
            color: '#1E293B',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  )
}