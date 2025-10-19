'use client'

import { toast } from 'sonner'

interface ToastOptions {
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  action?: {
    label: string
    onClick: () => void
  }
}

export const useToastNotification = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, options)
  }

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, options)
  }

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, options)
  }

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, options)
  }

  const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, messages, options)
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPromise
  }
}