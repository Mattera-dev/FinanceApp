import { IUserId } from "@/types/user";
import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_KEY = process.env.JWT_KEY || ""

export async function GET(req: NextRequest) {

    const token = req.cookies.get("auth_token")?.value
    if (!token) {
        return NextResponse.json({ message: "Forbidden" }, { status: 401 })
    }
    try {
        const { email, name } = verify(token, JWT_KEY) as IUserId;

        return NextResponse.json({ user: { email, name } })

    } catch (error) {
        return NextResponse.json({ message: 'Invalid token or expired' }, { status: 401 });

    }
}