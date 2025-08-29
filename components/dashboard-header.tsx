"use client"

import { authStore } from "@/app/stores/authStore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const { user, logout } = authStore()

  useEffect(() => {
    setUserName(user?.name ?? "")
  }, [])

  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
    }).then((res) => {

      if (res.ok) {
        logout()
        router.push("/")

      } else {
        console.error("Ocorreu um erro ao fazer logout")
      }

    })
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
