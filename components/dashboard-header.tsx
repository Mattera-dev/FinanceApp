"use client"

import { Button } from "@/components/ui/button"
import { removeAuthCookie, getAuthCookie } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const authData = getAuthCookie()
    if (authData) {
      setUserName(authData.user.name)
    }
  }, [])

  const handleLogout = () => {
    removeAuthCookie()
    router.push("/auth")
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">ZenFinance</h1>
          <p className="text-sm text-muted-foreground">Olá, {userName}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
