"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = "md", 
  className = "", 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={cn(
          "animate-spin rounded-full border-solid border-primary border-t-transparent",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  variant?: "spinner" | "dots" | "pulse"
}

export function Loading({ 
  size = "md", 
  className = "", 
  text,
  variant = "spinner"
}: LoadingProps) {
  if (variant === "dots") {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex space-x-1">
          <div className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-1 w-1" :
            size === "md" ? "h-2 w-2" :
            size === "lg" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: '0ms' }} />
          <div className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-1 w-1" :
            size === "md" ? "h-2 w-2" :
            size === "lg" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: '150ms' }} />
          <div className={cn(
            "animate-bounce rounded-full bg-primary",
            size === "sm" ? "h-1 w-1" :
            size === "md" ? "h-2 w-2" :
            size === "lg" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={cn(
          "animate-pulse rounded-full bg-primary/20",
          size === "sm" ? "h-4 w-4" :
          size === "md" ? "h-8 w-8" :
          size === "lg" ? "h-12 w-12" : "h-16 w-16"
        )} />
        {text && (
          <p className="text-sm text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    )
  }

  return <LoadingSpinner size={size} className={className} text={text} />
}