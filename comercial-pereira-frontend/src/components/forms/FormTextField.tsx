
import {
  TextField,
  type TextFieldProps,
} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText'> {
  name: FieldPath<T>
  control: Control<T>
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: FormTextFieldProps<T>) {
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
        />
      )}
    />
  )
}