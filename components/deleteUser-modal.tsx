"use client"

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authStore } from "@/app/stores/authStore";

interface DeleteUserModalProps {
    open: boolean;
    onClose: () => void;
}

export const DeleteUserModal = ({ open, onClose }: DeleteUserModalProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { logout, isGoogle } = authStore();

    const validateForm = () => {
        if (!email) {
            toast.error("Por favor, confirme seu e-mail.");
            return false;
        }

        if (!isGoogle && !password) {
            toast.error("Por favor, confirme sua senha.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const body = isGoogle ? { email } : { email, password };

            const res = await fetch("/api/auth/user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                logout();
                toast.success("Sua conta foi excluída com sucesso!");
                router.push("/");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Falha ao apagar a conta.");
            }
        } catch (error) {
            toast.error("Ocorreu um erro ao tentar apagar a conta.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setPassword("");
        onClose();
    };

    useEffect(() => {
        setEmail("");
        setPassword("");
    }, [open])

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-destructive">
                        Excluir Conta
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Atenção: Esta ação não pode ser desfeita. Sua conta e todos os dados associados serão excluídos permanentemente.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Confirme seu e-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            disabled={isLoading}
                        />
                    </div>

                    {!isGoogle && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Confirme sua senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha atual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="off"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={!email || (!isGoogle && !password) || isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Excluindo conta...
                                </div>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Confirmar Exclusão
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Ao confirmar, você concorda que entende as consequências desta ação.
                </p>
            </DialogContent>
        </Dialog>
    );
};