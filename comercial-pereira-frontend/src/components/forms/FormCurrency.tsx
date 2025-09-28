import React from 'react'
import {
  TextField,
  type TextFieldProps,


} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

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
        />
      )}
    />
  )
}