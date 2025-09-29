import React from 'react'
import {
  TextField,
  type TextFieldProps,
} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'

interface FormCurrencyProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText'> {
  name: FieldPath<T>
  control: Control<T>
}

const NumericFormatCustom = React.forwardRef<
  HTMLInputElement,
  NumericFormatProps
>((props, ref) => {
  return (
    <NumericFormat
      {...props}
      getInputRef={ref}
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
    />
  )
})

export function FormCurrency<T extends FieldValues>({
  name,
  control,
  sx,
  ...textFieldProps
}: FormCurrencyProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          margin="normal"
          InputProps={{
            inputComponent: NumericFormatCustom as any,
          }}
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
            '& .MuiInputBase-input': {
              color: '#1E293B',
              fontWeight: 500,
            },
            '& .MuiFormHelperText-root': {
              marginLeft: 0,
              fontWeight: 500,
            },
            ...sx,
          }}
        />
      )}
    />
  )
}