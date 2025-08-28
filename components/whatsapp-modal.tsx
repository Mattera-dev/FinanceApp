"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircleIcon, CheckCircleIcon } from "lucide-react"

interface WhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep("otp")
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)

    // Success - close modal and reset
    setStep("phone")
    setPhone("")
    setOtp("")
    onClose()

    // Show success message (you could add a toast here)
    alert("WhatsApp conectado com sucesso!")
  }

  const handleClose = () => {
    setStep("phone")
    setPhone("")
    setOtp("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleIcon className="h-5 w-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
        </DialogHeader>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Digite seu número do WhatsApp para receber notificações sobre suas finanças.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Enviando..." : "Continuar"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Enviamos um código de verificação para <strong>{phone}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Código de Verificação</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
              <p className="text-sm text-muted-foreground text-center">Digite o código de 6 dígitos que você recebeu</p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("phone")} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" disabled={isLoading || otp.length !== 6} className="flex-1">
                {isLoading ? "Verificando..." : "Verificar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
