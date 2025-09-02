// pages/api/auth/google/login.js
import { OAuth2Client } from "google-auth-library"
import { NextResponse } from "next/server";

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

// Define os escopos (quais dados do usuário você quer acessar)
const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

export async function GET() {
    // Gera a URL de autorização do Google
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Para obter um refresh token
        scope: scopes.join(' '),
        include_granted_scopes: true
    });

    // Redireciona o usuário para a página de login do Google
    return NextResponse.redirect(authorizationUrl);
}