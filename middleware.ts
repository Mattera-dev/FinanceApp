import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const PROTECTED_PATHS = ['/dashboard', '/transactions', '/reports'];

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
            const user = jwt.verify(token, JWT_SECRET);

            return NextResponse.next();
        } catch (error) {

            const loginUrl = new URL('/auth', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth|_not-found).*)'],
};