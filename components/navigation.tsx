"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  HomeIcon,
  CreditCardIcon,
  BarChart3Icon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  MessageCircleIcon,
} from "lucide-react"
import { removeAuthCookie, getAuthCookie } from "@/lib/auth"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authStore } from "@/app/stores/authStore"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Transações",
    href: "/transactions",
    icon: CreditCardIcon,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: BarChart3Icon,
  },
]

interface NavigationProps {
  onOpenWhatsApp?: () => void
  onOpenSettings?: () => void
}

export function Navigation({ onOpenWhatsApp, onOpenSettings }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const authData = authStore()

  useEffect(() => {
    setUserName(authData.user?.name ?? "<Erro>")
  }, [])

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
    }).then((res) => {

      if (res.ok) {
        authData.logout()
        router.push("/")

      } else {
        console.error("Ocorreu um erro ao fazer logout")
      }

    })
  }

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">ZenFinance</h1>
        <p className="text-sm text-muted-foreground">Olá, {userName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn("w-full justify-start gap-3 h-12", isActive && "bg-primary text-primary-foreground")}
              onClick={() => {
                router.push(item.href)
                setIsOpen(false)
              }}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Button>
          )
        })}

        <div className="pt-4 border-t border-border space-y-2">
          {onOpenWhatsApp && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => {
                onOpenWhatsApp()
                setIsOpen(false)
              }}
            >
              <MessageCircleIcon className="h-5 w-5" />
              Adicionar ao WhatsApp
            </Button>
          )}

          {onOpenSettings && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                onOpenSettings()
                setIsOpen(false)
              }}
            >
              <SettingsIcon className="h-5 w-5" />
              Configurações
            </Button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-transparent" onClick={handleLogout}>
          <LogOutIcon className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-card lg:border-r lg:border-border">
        <NavigationContent />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-primary">ZenFinance</h1>
            <p className="text-xs text-muted-foreground">Olá, {userName}</p>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
