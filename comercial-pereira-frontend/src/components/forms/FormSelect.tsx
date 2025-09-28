
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
  ...selectProps
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth margin="normal" error={!!fieldState.error}>
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