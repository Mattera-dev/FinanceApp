import { getUser } from "@/entities/user";
import { createJWT } from "@/lib/utils";
import { IUserLoginRequest } from "@/types/requests";
import { compareSync } from "bcrypt"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json() as IUserLoginRequest

    if (!email || !password) return NextResponse.json({ message: "Bad Request" }, { status: 400 })

    const user = await getUser({ email })

    if (!user) return NextResponse.json({ message: "not found" }, { status: 404 })

    if (compareSync(password, user.password)) {
        const token = createJWT({
            email: user.email,
            name: user.name,
            id: user.id,
            phone: user.phone
        })

        const res = NextResponse.json({ message: "Logged in!", user: { email: user.email, name: user.name, id: user.id, goal: user.goal, phone: user.phone } })

        res.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        })

        return res

    } else {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


}