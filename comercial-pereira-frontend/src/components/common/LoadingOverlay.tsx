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
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">{message}</Typography>
      </Box>
    </Backdrop>
  )
}