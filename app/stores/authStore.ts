import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"


interface IUser { name: string, email: string }

interface IAuthState {
    isLogged: boolean,
    token: string | null,
    user: IUser | null,
    login: (token: string, user: IUser) => void,
    logout: () => void;
}

export const authStore = create<IAuthState>()(
    persist(
        (set) => ({
            isLogged: false,
            token: null,
            user: null,

            login: (token: string, user: IUser) => set({
                token,
                user,
                isLogged: true
            }),

            logout: () => set({
                token: null,
                user: null,
                isLogged: false
            })
        }),
        {
            name: "finance-auth",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

