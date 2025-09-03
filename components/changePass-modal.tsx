"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authStore } from "@/app/stores/authStore";

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmNewPassword?: string }>({});
    const { isGoogle } = authStore()
    const router = useRouter();

    const validateForm = () => {
        const newErrors: { currentPassword?: string; newPassword?: string; confirmNewPassword?: string } = {};

        if (!isGoogle && !currentPassword) {
            newErrors.currentPassword = "Senha atual é obrigatória.";
        }

        if (!newPassword) {
            newErrors.newPassword = "Nova senha é obrigatória.";
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "A nova senha deve ter pelo menos 6 caracteres.";
        } else if (newPassword === currentPassword) {
            newErrors.newPassword = "A nova senha não pode ser igual à senha atual.";
        }

        if (!confirmNewPassword) {
            newErrors.confirmNewPassword = "Confirmação de senha é obrigatória.";
        } else if (newPassword !== confirmNewPassword) {
            newErrors.confirmNewPassword = "As senhas não coincidem.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const body = isGoogle ? { newPassword } : { currentPassword, newPassword };
            const res = await fetch("/api/auth/user/", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success("Senha alterada com sucesso!");
                onClose();
                router.refresh();
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Falha ao alterar a senha.");
            }
        } catch (error) {
            toast.error("Ocorreu um erro ao tentar alterar a senha.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setErrors({});
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-finance-primary">
                        <AlertTriangle className="w-5 h-5" />
                        Alterar Senha
                    </DialogTitle>
                    <DialogDescription>
                        {isGoogle ? (
                            "Sua conta foi registrada com o Google. Por favor, defina uma nova senha para seu perfil."
                        ) : (
                            "Por favor, insira sua senha atual e defina uma nova senha para sua conta."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isGoogle && (
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    setErrors(prev => ({ ...prev, currentPassword: "" }));
                                }}
                                disabled={isLoading}
                                className={errors.currentPassword ? "border-destructive" : ""}
                            />
                            {errors.currentPassword && (
                                <p className="text-sm text-destructive">{errors.currentPassword}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setErrors(prev => ({ ...prev, newPassword: "" }));
                            }}
                            disabled={isLoading}
                            className={errors.newPassword ? "border-destructive" : ""}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-destructive">{errors.newPassword}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                        <Input
                            id="confirmNewPassword"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => {
                                setConfirmNewPassword(e.target.value);
                                setErrors(prev => ({ ...prev, confirmNewPassword: "" }));
                            }}
                            disabled={isLoading}
                            className={errors.confirmNewPassword ? "border-destructive" : ""}
                        />
                        {errors.confirmNewPassword && (
                            <p className="text-sm text-destructive">{errors.confirmNewPassword}</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={isLoading || !!errors.currentPassword || !!errors.newPassword || !!errors.confirmNewPassword}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Alterando...
                                </>
                            ) : (
                                "Alterar Senha"
                            )}
                        </Button>
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    );
};