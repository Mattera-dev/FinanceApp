import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { createJWT } from "@/lib/utils";
import { getUser, createUser } from "@/entities/user";

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.json({ message: "No code provided" }, { status: 400 });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const userInfoResponse = await oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        });

        const { email, name } = userInfoResponse.data as { email: string, name: string };

        let user = await getUser({ email });

        if (!user) {
            user = await createUser({
                email,
                name,
                phone: "",
                password: "google_user_no_password_needed!",
            });
        }


        const token = createJWT({
            email: user.email,
            name: user.name,
            google: true,
            phone: user.phone,
            id: user.id
        });

        const res = NextResponse.redirect(new URL("/dashboard", req.url));


        res.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return res;

    } catch (error) {
        console.error("Authentication failed:", error);
        return NextResponse.redirect(new URL("/auth?error=failed", req.url));
    }
}