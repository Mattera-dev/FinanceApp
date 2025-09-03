import { IUser } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

interface IAuthState {
    isLogged: boolean,
    user: IUser | null,
    isLoading: boolean,
    isLogout: boolean,
    checkedAuth: boolean,
    isGoogle: boolean,
    goal: number,
    phone: string | null,
    login: (user: IUser, goal?: number, isGoogle?: boolean) => void,
    logout: () => void;
    resetLogout: () => void;
    checkAuth: () => Promise<void>
    setPhone: (phone: string) => Promise<void>
}

export const authStore = create<IAuthState>()(
    persist(
        (set, get) => ({
            isLogged: false,
            user: null,
            isLoading: true,
            checkedAuth: false,
            isGoogle: false,
            isLogout: false,
            goal: 0,
            phone: null,

            login: (user: IUser, goal?: number, isGoogle?: boolean) => set({
                user,
                goal: goal ?? 200000,
                isLogout: false,
                isLogged: true,
                isGoogle: isGoogle ?? false,
                phone: user.phone ?? null
            }),

            logout: () => set({
                user: null,
                goal: 0,
                isLogged: false,
                isLogout: true,
                isGoogle: false,
                phone: null,
                checkedAuth: false,
            }),

            resetLogout: () => set({ isLogout: false }),

            checkAuth: async () => {
                if (get().isLogged) {
                    console.log("ja ta logado")
                    console.log(get().phone)
                    set({ isLoading: false, checkedAuth: true })
                    return
                }

                try {
                    set({ checkedAuth: false })
                    const res = await fetch('/api/auth/me');

                    if (res.ok) {
                        const { user, google } = await res.json() as { user: IUser, google: boolean };
                        console.log(user)
                        set({
                            user: { name: user.name, email: user.email },
                            isLogged: true,
                            isGoogle: google,
                            phone: user.phone ?? null,
                        });
                    } else {
                        set({ user: null, isLogged: false, phone: null });
                    }
                } catch (error) {
                    console.error("Falha ao verificar autenticação:", error);
                } finally {
                    set({ isLoading: false, checkedAuth: true });
                }
            },

            setPhone: async (phoneNumber: string) => {
                const res = await fetch('/api/auth/user/phone', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneNumber })
                });

                if (res.ok) {
                    set({ phone: phoneNumber });
                    toast.success("Número do WhatsApp atualizado com sucesso!");
                } else {
                    const errorData = await res.json();
                    toast.error(errorData.message || "Falha ao atualizar o número.");
                    throw new Error("Falha ao atualizar o número.");
                }
            }
        }),
        {
            name: "finance-auth",
            storage: createJSONStorage(() => localStorage)
        }
    )
);