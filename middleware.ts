// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Suas URLs protegidas
const PROTECTED_PATHS = ['/dashboard', '/transacoes', '/relatorios'];

// Sua chave secreta do JWT (deve ser a mesma usada no login)
const JWT_SECRET = process.env.JWT_KEY || '';
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {

        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            const loginUrl = new URL('/auth', request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            jwt.verify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            const loginUrl = new URL('/auth', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Configuração do middleware para rodar em rotas que não são APIs ou arquivos estáticos
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
};