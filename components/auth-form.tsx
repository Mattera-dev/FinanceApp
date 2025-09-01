"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authStore } from "@/app/stores/authStore"
import { Chrome, Facebook } from "lucide-react"

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
    phone: "",
  })
  const [formatedPhone, setFormatedPhone] = useState<string>("")
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
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const requestBody = mode === "register"
        ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }
        : {
          email: formData.email,
          password: formData.password,
        };

      const res = await fetch(
        mode === "register" ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        let errorMsg = ""
        if (res.status == 401 || res.status == 404) {
          errorMsg = "Email ou senha incorretos"
        }
        throw new Error(errorMsg || "Ocorreu um erro no servidor.");
      }
      const data = await res.json();
      const { user } = data;
      console.log("esse vai ser o user da api")
      console.log(user)
      login({ email: user.email, name: user.name }, user.goal);

      setTimeout(() => {
        onSuccess();
      }, 100);

    } catch (error) {


      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Ocorreu um erro inesperado. Tente novamente." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    // 1. Limpa o telefone, mantendo apenas os dígitos
    const cleaned = phone.replace(/\D/g, '');
    let formatted = '';

    // 2. Adiciona a formatação com base no tamanho
    if (cleaned.length > 0) {
      formatted = `(${cleaned.substring(0, 2)}`;
    }
    if (cleaned.length > 2) {
      formatted += `) ${cleaned.substring(2, 7)}`;
    }
    if (cleaned.length > 7) {
      // Para números de 9 dígitos
      if (cleaned.length === 11) {
        formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
      } else {
        formatted += `-${cleaned.substring(7, 11)}`;
      }
    }

    return formatted;
  };

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

          {mode === "register" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formatedPhone}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    setFormatedPhone(formatPhone(rawValue));
                    setFormData((prev) => ({ ...prev, phone: rawValue.replace(/\D/g, '') }));
                  }}
                  maxLength={15}
                  className={`placeholder:text-slate-400 ${errors.phone ? "border-destructive" : ""}`}
                  placeholder="(__) _____-____"
                />

                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
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

          {mode === "login" && (
            <>
              <div className="w-full flex gap-4 flex-col md:flex-row justify-between">
                <Button type="button" variant={"destructive"} className="">
                  <Chrome /> Entrar com o google
                </Button>
                <Button type="button" variant={"default"} className="">
                  <Facebook /> Entrar com o facebook
                </Button>

              </div>
            </>
          )}



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
