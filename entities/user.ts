import { IUserRegisterRequest } from "@/types/requests";
import prisma from "@/lib/prisma"
import { IUserCredentials } from "@/types/user";


export async function createUser(userData: IUserRegisterRequest) {
    const newUser = await prisma.users.create({
        data: userData,
    })

    return newUser

}
export async function getUser(userData: IUserCredentials) {
    const user = await prisma.users.findFirst({
        where: {
            email: userData.email
        }
    })
    return user


}