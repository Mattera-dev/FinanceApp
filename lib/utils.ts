import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createJWT(obj: Object) {
  return jwt.sign(obj, process.env.JWT_KEY as string)
}