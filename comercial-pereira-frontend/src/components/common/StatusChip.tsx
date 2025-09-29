import React from 'react'
import { Chip, type ChipProps, } from '@mui/material'

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string
  type?: 'sale' | 'inventory' | 'user' | 'product' | 'default'
}

const statusConfigs = {
  sale: {
    PENDING: { 
      label: 'Pendente', 
      sx: { 
        backgroundColor: '#FEF3C7', 
        color: '#92400E',
        fontWeight: 600,
        border: '1px solid #F59E0B'
      } 
    },
    COMPLETED: { 
      label: 'Concluída', 
      sx: { 
        backgroundColor: '#D1FAE5', 
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981'
      } 
    },
    CANCELLED: { 
      label: 'Cancelada', 
      sx: { 
        backgroundColor: '#FEE2E2', 
        color: '#991B1B',
        fontWeight: 600,
        border: '1px solid #EF4444'
      } 
    },
  },
  inventory: {
    OK: { 
      label: 'Normal', 
      sx: { 
        backgroundColor: '#D1FAE5', 
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981'
      } 
    },
    LOW: { 
      label: 'Baixo', 
      sx: { 
        backgroundColor: '#FEF3C7', 
        color: '#92400E',
        fontWeight: 600,
        border: '1px solid #F59E0B'
      } 
    },
    OUT_OF_STOCK: { 
      label: 'Sem Estoque', 
      sx: { 
        backgroundColor: '#FEE2E2', 
        color: '#991B1B',
        fontWeight: 600,
        border: '1px solid #EF4444'
      } 
    },
    EXCESS: { 
      label: 'Excesso', 
      sx: { 
        backgroundColor: '#DBEAFE', 
        color: '#1E40AF',
        fontWeight: 600,
        border: '1px solid #3B82F6'
      } 
    },
  },
  user: {
    ACTIVE: { 
      label: 'Ativo', 
      sx: { 
        backgroundColor: '#D1FAE5', 
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981'
      } 
    },
    INACTIVE: { 
      label: 'Inativo', 
      sx: { 
        backgroundColor: '#F1F5F9', 
        color: '#475569',
        fontWeight: 600,
        border: '1px solid #94A3B8'
      } 
    },
    BLOCKED: { 
      label: 'Bloqueado', 
      sx: { 
        backgroundColor: '#FEE2E2', 
        color: '#991B1B',
        fontWeight: 600,
        border: '1px solid #EF4444'
      } 
    },
  },
  product: {
    ACTIVE: { 
      label: 'Ativo', 
      sx: { 
        backgroundColor: '#D1FAE5', 
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981'
      } 
    },
    INACTIVE: { 
      label: 'Inativo', 
      sx: { 
        backgroundColor: '#F1F5F9', 
        color: '#475569',
        fontWeight: 600,
        border: '1px solid #94A3B8'
      } 
    },
    DISCONTINUED: { 
      label: 'Descontinuado', 
      sx: { 
        backgroundColor: '#FEE2E2', 
        color: '#991B1B',
        fontWeight: 600,
        border: '1px solid #EF4444'
      } 
    },
  },
  default: {
    ACTIVE: { 
      label: 'Ativo', 
      sx: { 
        backgroundColor: '#D1FAE5', 
        color: '#065F46',
        fontWeight: 600,
        border: '1px solid #10B981'
      } 
    },
    INACTIVE: { 
      label: 'Inativo', 
      sx: { 
        backgroundColor: '#F1F5F9', 
        color: '#475569',
        fontWeight: 600,
        border: '1px solid #94A3B8'
      } 
    },
  },
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  type = 'default',
  ...props
}) => {
  const config = (statusConfigs[type] as any)[status] || {
    label: status,
    sx: { 
      backgroundColor: '#F1F5F9', 
      color: '#475569',
      fontWeight: 600,
      border: '1px solid #94A3B8'
    },
  }

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        borderRadius: '6px',
        height: '24px',
        fontSize: '12px',
        ...config.sx
      }}
      {...props}
    />
  )
}