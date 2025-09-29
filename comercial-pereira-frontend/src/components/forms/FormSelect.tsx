import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  type SelectProps,
} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'

interface Option {
  value: string | number
  label: string
}

interface FormSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Option[]
  emptyOption?: boolean
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  emptyOption = true,
  sx,
  ...selectProps
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!fieldState.error}
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
              '&.Mui-error fieldset': {
                borderColor: '#EF4444',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#64748B',
              fontWeight: 500,
              '&.Mui-focused': {
                color: '#3B82F6',
              },
              '&.Mui-error': {
                color: '#EF4444',
              },
            },
            '& .MuiSelect-select': {
              color: '#1E293B',
              fontWeight: 500,
            },
            '& .MuiFormHelperText-root': {
              marginLeft: 0,
              fontWeight: 500,
            },
            ...sx,
          }}
        >
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} {...selectProps}>
            {emptyOption && (
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && (
            <FormHelperText>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}