import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const res = NextResponse.json({ message: "logged out!" })

    res.cookies.delete("auth_token")

    return res

}