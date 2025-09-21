// components/ui/toast.tsx
"use client"

import { toast as sonnerToast, Toaster, ExternalToast } from 'sonner'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

// Custom toast function that wraps sonner with our styling
const toast = {
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      ...options,
      icon: <CheckCircle className="h-4 w-4" />,
      className: cn(
        "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200",
        options?.className
      ),
    })
  },
  
  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      ...options,
      icon: <XCircle className="h-4 w-4" />,
      className: cn(
        "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200",
        options?.className
      ),
    })
  },
  
  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      ...options,
      icon: <AlertCircle className="h-4 w-4" />,
      className: cn(
        "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200",
        options?.className
      ),
    })
  },
  
  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      ...options,
      icon: <Info className="h-4 w-4" />,
      className: cn(
        "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200",
        options?.className
      ),
    })
  },
  
  // Basic toast without specific styling
  message: (message: string, options?: ExternalToast) => {
    return sonnerToast(message, options)
  },

  // Promise toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      className: "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200",
    })
  },

  // Dismiss toasts
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
}

const ToastProvider = (
  props: React.ComponentProps<typeof Toaster>
) => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: cn(
          "group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg"
        ),
        closeButton: true,
      }}
      closeButton
      richColors={false}
      {...props}
    />
  )
}

export { toast, ToastProvider }
export type { ExternalToast as ToastOptions } from 'sonner'