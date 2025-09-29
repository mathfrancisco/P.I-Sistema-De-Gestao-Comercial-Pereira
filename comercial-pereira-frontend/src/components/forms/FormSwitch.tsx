import React from 'react'
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
  sx,
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
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#3B82F6',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#3B82F6',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#E2E8F0',
                },
                ...sx,
              }}
            />
          }
          label={label}
          sx={{
            '& .MuiFormControlLabel-label': {
              color: '#1E293B',
              fontWeight: 500,
            },
          }}
        />
      )}
    />
  )
}
