"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storeUser, validateUser, setAuthCookie } from "@/lib/auth"
import { authStore } from "@/app/stores/authStore"

interface AuthFormProps {
  mode: "login" | "register"
  onSuccess: () => void
  onToggleMode: () => void
}

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "", // NOVO: Adiciona o campo de telefone ao estado
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = authStore()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    if (mode === "register") {
      if (!formData.name) {
        newErrors.name = "Nome é obrigatório"
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem"
      }
      // NOVO: Adiciona a validação para o campo de telefone
      if (!formData.phone) {
        newErrors.phone = "Telefone é obrigatório";
      } else if (!/^\(?([0-9]{2})\)?([0-9]{4,5})-?([0-9]{4})$/.test(formData.phone)) {
        newErrors.phone = "Telefone inválido";
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      if (mode === "register") {
        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }).then(async data => await data.json())

        if (!res) setErrors({ general: "Ocorreu um erro! Tente novamente." })

        const { name, id, email } = res as { name: string, id: string, email: string }

        // login()

        setTimeout(() => {
          onSuccess()
        }, 100)
      } else {
        const user = validateUser(formData.email, formData.password)

        if (user) {
          const authData = {
            user,
            token: `token-${user.id}-${Date.now()}`,
          }

          setAuthCookie(authData)
          setTimeout(() => {
            onSuccess()
          }, 100)
        } else {
          setErrors({ general: "Email ou senha incorretos" })
        }
      }
    } catch (error) {
      setErrors({ general: "Erro interno. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Entre na sua conta para gerenciar suas finanças"
            : "Crie sua conta para começar a gerenciar suas finanças"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              {/* NOVO: Campo de Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel" // Use o tipo 'tel' para telefones
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
          )}

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar Conta"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={onToggleMode} className="text-sm text-primary hover:underline">
              {mode === "login" ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
