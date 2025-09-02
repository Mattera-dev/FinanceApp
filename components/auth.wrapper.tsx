"use client"

import { useEffect } from 'react';
import { authStore } from '@/app/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingPage } from './loading-spinner';
import { toast } from 'sonner';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const unauthenticatedPaths = ['/auth', '/'];

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { isLoading, isLogged, isLogout, checkedAuth, checkAuth, resetLogout } = authStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const isAuthPath = unauthenticatedPaths.includes(pathname);

    useEffect(() => {
        if (!isLoading && checkedAuth) {
            if (!isLogged && !isAuthPath) {
                router.push("/auth")
            }
        }
    }, [isLoading, isLogged, isAuthPath, checkedAuth, router]);

    useEffect(() => {
        if (isLogout) {
            toast.success("Deslogado com sucesso!");
            resetLogout();
            router.push('/auth');
        }
    }, [isLogout, resetLogout, router]);

    if (isLoading) {
        return <LoadingPage message='Carregando dados...' />;
    }

    return <>{children}</>;
}