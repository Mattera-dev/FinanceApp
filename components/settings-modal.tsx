"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { SettingsIcon, UserIcon, BellIcon, ShieldIcon, LogOutIcon, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { authStore } from "@/app/stores/authStore"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const { user, logout } = authStore()


  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }


  const handleLogout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
    }).then((res) => {

      if (res.ok) {
        logout()
        onClose()
        router.push("/")

      } else {
        console.error("Ocorreu um erro ao fazer logout")
      }

    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configurações
          </DialogTitle>
          <DialogDescription >
            Menu de configurações
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <h3 className="font-medium">Perfil</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={user?.name ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email} disabled />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BellIcon className="h-4 w-4" />
                <h3 className="font-medium">Preferências</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações</Label>
                  <p className="text-sm text-muted-foreground">Receber alertas sobre gastos</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <div>
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Tema escuro da aplicação</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                <h3 className="font-medium">Segurança</h3>
              </div>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Autenticação em Duas Etapas
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium">Dados</h3>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Exportar Dados
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent text-destructive hover:text-destructive"
              >
                Limpar Todos os Dados
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button onClick={() => { }} className="w-full">
                Salvar Alterações
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOutIcon className="h-4 w-4" />
                Sair da Conta
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
