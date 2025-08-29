// components/AuthWrapper.tsx
"use client"

import { useEffect } from 'react';
import { authStore } from '@/app/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingPage } from './loading-spinner';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const unauthenticatedPaths = ['/auth', '/']; // Suas rotas públicas

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { isLoading, isLogged, isLogout, checkAuth } = authStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Chama a verificação apenas uma vez na montagem
        checkAuth();
    }, [checkAuth]);

    // Se a rota for de login, não precisa redirecionar
    const isAuthPath = unauthenticatedPaths.includes(pathname);

    // Lida com o estado de carregamento e redirecionamento
    if (isLoading) {
        return <LoadingPage message='Carregando dados do usuario...</div>' />;
    }

    if (!isLogged && !isAuthPath && !isLogout) {
        router.push('/auth');
        return null;
    }

    // Renderiza o conteúdo da página quando o estado estiver pronto
    return <>{children}</>;
}