"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { authStore } from "../stores/authStore"
import { toast } from "sonner"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLogged } = authStore()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error == "failed") {
      toast.error("Ocorreu um erro, tente novamente!")
    }
    
    const urlMode = searchParams.get("mode")
    if (urlMode === "register") {
      setMode("register")
    }

    if (isLogged) {
      router.push("/dashboard")
    }
  }, [router, searchParams])

  const handleAuthSuccess = () => {
    router.push("/dashboard")
  }

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">


        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">ZenFinance</h1>
          </div>
          <p className="text-muted-foreground">Gerencie suas finanças pessoais</p>
        </div>

        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Homepage
          </Button>
        </div>

        <AuthForm mode={mode} onSuccess={handleAuthSuccess} onToggleMode={toggleMode} />
      </div>
    </div>
  )
}
