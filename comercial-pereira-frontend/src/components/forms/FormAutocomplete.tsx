
import {
  Autocomplete,
  TextField,
  type AutocompleteProps,
 
} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues, } from 'react-hook-form'

interface FormAutocompleteProps<T extends FieldValues, Option>
  extends Omit<
    AutocompleteProps<Option, false, false, false>,
    'renderInput' | 'value' | 'onChange'
  > {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
}

export function FormAutocomplete<T extends FieldValues, Option>({
  name,
  control,
  label,
  placeholder,
  ...autocompleteProps
}: FormAutocompleteProps<T, Option>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState }) => (
        <Autocomplete
          {...autocompleteProps}
          value={value || null}
          onChange={(_, newValue) => onChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
              margin="normal"
            />
          )}
        />
      )}
    />
  )
}