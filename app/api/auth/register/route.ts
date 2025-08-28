import { createUser } from "@/entities/user";
import { IUserRegisterRequest } from "@/types/requests";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt"
import { createJWT } from "@/lib/utils";

export async function POST(req: NextRequest) {
    const { name, email, phone, password } = await req.json() as IUserRegisterRequest

    if (!name || !email || !phone || !password) return NextResponse.json({ message: "Bad Request" }, { status: 400 })


    const hashedPass = await hash(password, 10)

    const user: IUserRegisterRequest = {
        email,
        name,
        password: hashedPass,
        phone
    }

    const newUser = await createUser(user)

    if (!newUser) return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })

    const token = createJWT({
        email,
        name,
        id: newUser.id
    })

    const res = NextResponse.json({ message: "User created", user: { name: newUser.name, id: newUser.id, email: newUser.email } }, { status: 201 })

    res.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
    })


    return res

}