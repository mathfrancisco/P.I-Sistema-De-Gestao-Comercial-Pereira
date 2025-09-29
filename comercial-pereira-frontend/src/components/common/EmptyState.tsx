import React from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material'
import {
  Inbox as InboxIcon,
  Add as AddIcon,
} from '@mui/icons-material'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    startIcon?: React.ReactNode
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <Paper 
      sx={{
        borderRadius: '16px',
        backgroundColor: '#FAFBFF',
        border: '1px solid #E3F2FD',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.08)',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={6}
        textAlign="center"
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#EBF8FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              fontSize: 40,
              color: '#60A5FA',
            }}
          >
            {icon || <InboxIcon fontSize="inherit" />}
          </Box>
        </Box>
                
        <Typography 
          variant="h5" 
          sx={{
            fontWeight: 600,
            color: '#1E293B',
            mb: 1,
          }}
        >
          {title}
        </Typography>
                
        {description && (
          <Typography
            variant="body1"
            sx={{ 
              color: '#64748B',
              mb: 4, 
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        )}
                
        {action && (
          <Button
            variant="contained"
            startIcon={action.startIcon || <AddIcon />}
            onClick={action.onClick}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Paper>
  )
}