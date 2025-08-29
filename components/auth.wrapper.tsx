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
        checkAuth();
    }, [checkAuth]);

    const isAuthPath = unauthenticatedPaths.includes(pathname);

    if (isLoading) {
        return <LoadingPage message='Carregando dados do usuario...' />;
    }

    if (!isLogged && !isAuthPath && !isLogout) {
        router.push('/auth');
        return null;
    }

    // Renderiza o conteúdo da página quando o estado estiver pronto
    return <>{children}</>;
}