import { IUserRegisterRequest } from "@/types/requests";
import prisma from "@/lib/prisma"
import { IUser, IUserCredentials } from "@/types/user";


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

export async function deleteUser(userData: IUser) {
    try {

        const user = await prisma.users.delete({
            where: {
                email: userData.email
            }
        })
        return user
    } catch (error) {
        return null
    }

}