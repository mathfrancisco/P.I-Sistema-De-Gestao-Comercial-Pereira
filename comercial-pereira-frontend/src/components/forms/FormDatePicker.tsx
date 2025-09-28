
import { DatePicker, type DatePickerProps  } from '@mui/x-date-pickers'
import { TextField } from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'

interface FormDatePickerProps<T extends FieldValues>
  extends Omit<DatePickerProps<Date>, 'value' | 'onChange'> {
  name: FieldPath<T>
  control: Control<T>
  label: string
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  ...datePickerProps
}: FormDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          {...field}
          {...datePickerProps}
          label={label}
          slots={{
            textField: TextField,
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal' as const,
              error: !!fieldState.error,
              helperText: fieldState.error?.message,
            },
          }}
        />
      )}
    />
  )
}