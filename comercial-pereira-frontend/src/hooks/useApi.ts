import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'react-hot-toast'

interface UseApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

export const useApi = <T = unknown>(
  apiFunc: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso',
    errorMessage = 'Erro ao realizar operação',
  } = options
  
  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await apiFunc(...args)
        setData(result)
        
        if (showSuccessToast) {
          toast.success(successMessage)
        }
        
        return result
      } catch (err) {
        const error = err as Error | AxiosError
        setError(error)
        
        if (showErrorToast) {
          if ('response' in error && error.response?.data) {
            const data = error.response.data as unknown as { message?: string }
            toast.error(data.message || errorMessage)
          } else {
            toast.error(errorMessage)
          }
        }
        
        throw error
      } finally {
        setLoading(false)
      }
    },
    [apiFunc, showSuccessToast, showErrorToast, successMessage, errorMessage]
  )
  
  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }
  
  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}