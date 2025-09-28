
import {
  FormControlLabel,
  Switch,
type SwitchProps,
} from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues,  } from 'react-hook-form'

interface FormSwitchProps<T extends FieldValues>
  extends Omit<SwitchProps, 'name' | 'value' | 'onChange'> {
  name: FieldPath<T>
  control: Control<T>
  label: string
}

export function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
  ...switchProps
}: FormSwitchProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              {...field}
              {...switchProps}
              checked={field.value || false}
            />
          }
          label={label}
        />
      )}
    />
  )
}