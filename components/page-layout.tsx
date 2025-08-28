"use client"

import type React from "react"

import { Navigation } from "./navigation"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  onOpenWhatsApp?: () => void
  onOpenSettings?: () => void
}

export function PageLayout({ children, className, onOpenWhatsApp, onOpenSettings }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation onOpenWhatsApp={onOpenWhatsApp} onOpenSettings={onOpenSettings} />
      <div className={cn("lg:pl-64", className)}>{children}</div>
    </div>
  )
}
