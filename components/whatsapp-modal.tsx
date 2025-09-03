"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircleIcon, CheckCircleIcon, Phone } from "lucide-react"
import { DialogDescription } from "@radix-ui/react-dialog"
import { authStore } from "@/app/stores/authStore"
import { toast } from "sonner"

interface WhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "add-phone" | "confirm-phone" | "edit-phone" | "otp";

// Função para formatar o número de telefone
const formatPhoneNumber = (value: string) => {
  if (!value) return '';

  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 11); // Limita a entrada a 11 dígitos

  if (limited.length === 11) {
    return limited.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (limited.length === 10) {
    return limited.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  // Lógica para formatação enquanto o usuário digita
  if (limited.length > 2) {
    return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
  } else if (limited.length > 0) {
    return `(${limited}`;
  }

  return limited;
};

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
  const [step, setStep] = useState<Step>("add-phone");
  const [localPhone, setLocalPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { phone, setPhone } = authStore();

  useEffect(() => {
    if (isOpen) {
      if (phone) {
        setStep("confirm-phone");
        setLocalPhone(formatPhoneNumber(phone));
      } else {
        setStep("add-phone");
        setLocalPhone("");
      }
    } else {
      setStep("add-phone");
      setLocalPhone("");
      setOtp("");
    }
  }, [isOpen, phone]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numberToSubmit = localPhone.replace(/\D/g, "").trim();

    if (!numberToSubmit || numberToSubmit.length < 10) {
      toast.error("Por favor, digite um número de telefone válido.");
      return;
    }

    setIsLoading(true);

    try {
      await setPhone(numberToSubmit)
      setStep("otp");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsLoading(true);
    // Lógica para verificar o código OTP
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);

    toast.success("WhatsApp conectado com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleIcon className="h-5 w-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription className="sr-only">
            Menu para conexao ao whatsapp
          </DialogDescription>
        </DialogHeader>

        {step === "add-phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tempPhone">Adicione seu Número do WhatsApp</Label>
              <Input
                id="tempPhone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={localPhone}
                onChange={(e) => setLocalPhone(formatPhoneNumber(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">
                Digite seu número para receber notificações sobre suas finanças.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Enviando..." : "Continuar"}
              </Button>
            </div>
          </form>
        )}

        {step === "confirm-phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                value={localPhone}
                readOnly
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Deseja confirmar o número acima para receber o código?
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("add-phone")} className="flex-1 bg-transparent">
                Editar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Enviamos um código de verificação para <strong>{formatPhoneNumber(phone as string)}</strong>
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
              <Button type="button" variant="outline" onClick={() => setStep(phone ? "confirm-phone" : "add-phone")} className="flex-1">
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
  );
}