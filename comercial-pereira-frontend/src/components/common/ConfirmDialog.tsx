import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material'

export const ConfirmDialog: React.FC<{
  open: boolean
  title: string
  message: string
  type?: 'warning' | 'error' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}> = ({
  open,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const icons = {
    warning: <WarningIcon sx={{ fontSize: 48, color: '#F59E0B' }} />,
    error: <ErrorIcon sx={{ fontSize: 48, color: '#EF4444' }} />,
    info: <InfoIcon sx={{ fontSize: 48, color: '#3B82F6' }} />,
    success: <SuccessIcon sx={{ fontSize: 48, color: '#10B981' }} />,
  }

  const confirmColors = {
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
  }

  const backgroundColors = {
    warning: '#FEF3C7',
    error: '#FEE2E2',
    info: '#DBEAFE',
    success: '#D1FAE5',
  }

  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(59, 130, 246, 0.15)',
          background: 'white',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              backgroundColor: backgroundColors[type],
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${confirmColors[type]}30`,
            }}
          >
            {icons[type]}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onCancel}
          disabled={loading}
          sx={{ 
            position: 'absolute', 
            right: 16, 
            top: 16,
            color: '#64748B',
            '&:hover': {
              backgroundColor: '#F1F5F9',
              color: '#475569',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2, px: 4 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#64748B', 
            lineHeight: 1.6,
            fontSize: '16px',
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 4, gap: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onCancel} 
          disabled={loading}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            color: '#64748B',
            fontWeight: 600,
            px: 6,
            py: 2,
            border: '2px solid #E2E8F0',
            '&:hover': {
              backgroundColor: '#F8FAFC',
              borderColor: '#CBD5E1',
              color: '#475569',
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 6,
            py: 2,
            backgroundColor: confirmColors[type],
            boxShadow: `0 8px 25px ${confirmColors[type]}40`,
            '&:hover': {
              backgroundColor: confirmColors[type],
              boxShadow: `0 12px 35px ${confirmColors[type]}60`,
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              backgroundColor: '#E2E8F0',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}