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
            borderColor: '#E3F2FD',
          },
          '&:hover fieldset': {
            borderColor: '#93C5FD',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3B82F6',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
        '& .MuiInputBase-input': {
          color: '#1E293B',
          fontWeight: 500,
        },
        '& .MuiInputBase-input::placeholder': {
          color: '#94A3B8',
          opacity: 1,
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#60A5FA' }} />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={handleClear}
              sx={{
                color: '#94A3B8',
                '&:hover': {
                  backgroundColor: '#EBF8FF',
                  color: '#3B82F6',
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