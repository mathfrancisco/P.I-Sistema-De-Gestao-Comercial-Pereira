import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration, action }: ToastOptions) => {
    const message = title || description || ''
    const fullMessage = title && description ? `${title}: ${description}` : message

    const options = {
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    }

    switch (variant) {
      case 'destructive':
        return sonnerToast.error(fullMessage, options)
      case 'success':
        return sonnerToast.success(fullMessage, options)
      case 'warning':
        return sonnerToast.warning(fullMessage, options)
      case 'info':
        return sonnerToast.info(fullMessage, options)
      default:
        return sonnerToast(fullMessage, options)
    }
  }

  return { toast }
}

// Exporta o toast direto também para compatibilidade
export { toast } from 'sonner'