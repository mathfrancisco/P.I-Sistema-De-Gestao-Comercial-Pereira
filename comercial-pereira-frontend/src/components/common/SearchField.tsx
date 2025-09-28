import React from 'react'
import {
  TextField,
  InputAdornment,
  IconButton,
  type TextFieldProps
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'

interface SearchFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
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
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  )
}