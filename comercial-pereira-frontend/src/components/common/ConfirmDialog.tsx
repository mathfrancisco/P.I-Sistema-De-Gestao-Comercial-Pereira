import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  type?: 'warning' | 'error' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
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
    warning: <WarningIcon color="warning" fontSize="large" />,
    error: <ErrorIcon color="error" fontSize="large" />,
    info: <InfoIcon color="info" fontSize="large" />,
    success: <SuccessIcon color="success" fontSize="large" />,
  }

  const confirmColors = {
    warning: 'warning' as const,
    error: 'error' as const,
    info: 'primary' as const,
    success: 'success' as const,
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {icons[type]}
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={onCancel} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColors[type]}
          variant="contained"
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}