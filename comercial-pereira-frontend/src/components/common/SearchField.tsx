import React from 'react'
import {
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'


export const SearchField: React.FC<{
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  sx?: any
}> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  sx,
  ...props
}) => {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#F8FAFC',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#4F46E5',
            borderWidth: '2px',
          },
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#9CA3AF' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={handleClear}
              sx={{
                color: '#9CA3AF',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                }
              }}
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  )
}