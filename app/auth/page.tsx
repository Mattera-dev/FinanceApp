"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { getAuthCookie } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL params for mode
    const urlMode = searchParams.get("mode")
    if (urlMode === "register") {
      setMode("register")
    }

    // Redirect if already authenticated
    const authData = getAuthCookie()
    if (authData) {
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
            <h1 className="text-3xl font-bold text-primary">FinanceApp</h1>
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
