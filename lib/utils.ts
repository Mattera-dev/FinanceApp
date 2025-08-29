import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { IUserId } from "@/types/user"

const JWT_KEY = process.env.JWT_KEY as string

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createJWT(obj: Object) {
  return jwt.sign(obj, JWT_KEY)
}

export function getDataFromToken(req: NextRequest): null | IUserId {
  const token = req.cookies.get("auth_token")?.value
  if (!token) {
    return null
  }

  try {
    const userData = jwt.verify(token, JWT_KEY) as IUserId;
    return userData
  } catch (error) {
    return null

  }

}