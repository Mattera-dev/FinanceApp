import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export async function getTransactionsById(id: string) {

    return await prisma.transaction.findMany({
        where: {
            userId: id
        }
    })

}
export async function updateTransaction(id: string, userId: string, updatedData: {
    title?: string,
    amount?: number,
    type?: $Enums.TransactionType
}) {
    return await prisma.transaction.update({
        where: {
            id: id,
            userId
        },
        data: updatedData
    });
}

export async function deleteTransaction(id: string, userId: string) {
    return await prisma.transaction.delete({
        where: {
            id: id,
            userId
        }
    });
}

export async function createTransaction(
    title: string,
    amount: number,
    type: $Enums.TransactionType,
    date: Date,
    userId: string,
) {
    return await prisma.transaction.create({
        data: {
            title,
            amount,
            type,
            userId,
            date,
        },
    });
}
