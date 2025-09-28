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
    warning: <WarningIcon sx={{ color: '#F59E0B', fontSize: 48 }} />,
    error: <ErrorIcon sx={{ color: '#EF4444', fontSize: 48 }} />,
    info: <InfoIcon sx={{ color: '#3B82F6', fontSize: 48 }} />,
    success: <SuccessIcon sx={{ color: '#10B981', fontSize: 48 }} />,
  }

  const confirmColors = {
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#4F46E5',
    success: '#10B981',
  }

  const backgroundColors = {
    warning: '#FFFBEB',
    error: '#FEF2F2',
    info: '#F0F4FF',
    success: '#ECFDF5',
  }

  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              backgroundColor: backgroundColors[type],
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icons[type]}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onCancel}
          disabled={loading}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            color: '#64748B',
            '&:hover': {
              backgroundColor: '#F1F5F9',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body1" sx={{ color: '#64748B', lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onCancel} 
          disabled={loading}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            color: '#64748B',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            border: '1px solid #E2E8F0',
            '&:hover': {
              backgroundColor: '#F8FAFC',
              borderColor: '#CBD5E1',
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
            px: 4,
            py: 1.5,
            backgroundColor: confirmColors[type],
            boxShadow: `0 4px 15px ${confirmColors[type]}40`,
            '&:hover': {
              backgroundColor: confirmColors[type],
              boxShadow: `0 6px 20px ${confirmColors[type]}60`,
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              backgroundColor: '#E2E8F0',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
