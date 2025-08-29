"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function LoadingPage({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center flex items-center justify-center flex-col gap-4 space-y-4">
        <LoadingSpinner size="lg" />
        <h1 className="text-2xl font-bold text-primary">{message}</h1>
      </div>
    </div>
  )
}
