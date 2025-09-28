import React from 'react'
import { Chip, type ChipProps, } from '@mui/material'

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string
  type?: 'sale' | 'inventory' | 'user' | 'product' | 'default'
}

const statusConfigs = {
  sale: {
    PENDING: { label: 'Pendente', color: 'warning' as const },
    COMPLETED: { label: 'Concluída', color: 'success' as const },
    CANCELLED: { label: 'Cancelada', color: 'error' as const },
  },
  inventory: {
    OK: { label: 'Normal', color: 'success' as const },
    LOW: { label: 'Baixo', color: 'warning' as const },
    OUT_OF_STOCK: { label: 'Sem Estoque', color: 'error' as const },
    EXCESS: { label: 'Excesso', color: 'info' as const },
  },
  user: {
    ACTIVE: { label: 'Ativo', color: 'success' as const },
    INACTIVE: { label: 'Inativo', color: 'default' as const },
    BLOCKED: { label: 'Bloqueado', color: 'error' as const },
  },
  product: {
    ACTIVE: { label: 'Ativo', color: 'success' as const },
    INACTIVE: { label: 'Inativo', color: 'default' as const },
    DISCONTINUED: { label: 'Descontinuado', color: 'error' as const },
  },
  default: {
    ACTIVE: { label: 'Ativo', color: 'success' as const },
    INACTIVE: { label: 'Inativo', color: 'default' as const },
  },
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  type = 'default',
  ...props
}) => {
  const config = (statusConfigs[type] as any)[status] || {
    label: status,
    color: 'default' as const,
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      {...props}
    />
  )
}