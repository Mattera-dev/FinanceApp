import { IUser } from "@/types/user";
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"



interface IAuthState {
    isLogged: boolean,
    user: IUser | null,
    isLoading: boolean,
    isLogout: boolean,
    goal: number,
    login: (user: IUser, goal?: number) => void,
    logout: () => void;
    checkAuth: () => Promise<void>
}

export const authStore = create<IAuthState>()(
    persist(
        (set, get) => ({
            isLogged: false,
            user: null,
            isLoading: true,
            isLogout: false,
            goal: 0,

            login: (user: IUser, goal?: number) => set({

                user,
                goal: goal ?? 2000,
                isLogout: false,
                isLogged: true
            }),

            logout: () => set({
                user: null,
                isLogged: false,
                isLogout: true
            }),
            checkAuth: async () => {
                if (get().isLogged) {
                    set({ isLoading: false })
                    return
                }

                try {
                    const res = await fetch('/api/auth/me');
                    if (res.ok) {
                        const { user } = await res.json() as { user: IUser };
                        await set({ user: { name: user.name, email: user.email }, isLogged: true });
                    } else {
                        set({ user: null, isLogged: false });
                    }
                } catch (error) {
                    console.error("Falha ao verificar autenticação:", error);
                } finally {
                    set({ isLoading: false });
                }
            }
        }),
        {
            name: "finance-auth",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

