import { useForm as useReactHookForm, type UseFormProps, type Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export const useFormWithValidation = <T extends Record<string, unknown>>(
  schema: yup.ObjectSchema<T>,
  options?: UseFormProps<T>
) => {
  return useReactHookForm<T>({
    resolver: yupResolver(schema) as Resolver<T>,
    mode: 'onChange',
    ...options,
  })
}