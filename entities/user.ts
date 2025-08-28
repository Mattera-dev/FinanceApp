import { IUserRegisterRequest } from "@/types/requests";
import prisma from "@/lib/prisma"


export async function createUser(user: IUserRegisterRequest) {
    const newUser = await prisma.users.create({
        data: user,
    })

    if (!newUser) return false

    return newUser

}