'use client'

import { useLoading } from '@/hooks/use-loading'
import { Loading } from '@/components/ui/loading-spinner'

export function GlobalLoading() {
  const { isLoading, error, progress } = useLoading()

  if (!isLoading && !error) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        {isLoading && (
          <div className="text-center">
            <Loading size="lg" text="Carregando..." />
            {progress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}%</p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Erro
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}