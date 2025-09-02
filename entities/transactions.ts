import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { ITransaction } from "@/types/transactions";

export async function getTransactionsById(id: string) {

    return await prisma.users.findFirst({
        where: {
            id
        },
        include: {
            Transaction: {
                where: {
                    userId: id,
                },
                orderBy: {
                    date: 'desc',
                },
            }
        }
    })

}

export async function getTransactionsByMonth(userId: string): Promise<{ transactions: ITransaction[], balance: number }> {

    const today = new Date();


    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);


    const userWithTransactions = await prisma.users.findFirst({
        where: {
            id: userId
        },
        include: {
            Transaction: {
                where: {
                    userId: userId,
                    date: {
                        gte: firstDayOfMonth,
                        lte: today,
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            }
        }
    })


    return { transactions: userWithTransactions?.Transaction ?? [], balance: Number(userWithTransactions?.balance.toString()) ?? 0 };
}

export async function getTransactionsLastSixMonths(userId: string): Promise<{ transactions: ITransaction[], balance: number }> {

    const today = new Date();


    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);


    const userWithTransactions = await prisma.users.findUnique({
        where: {
            id: userId
        },
        include: {
            Transaction: {
                where: {
                    userId: userId,
                    date: {
                        gte: sixMonthsAgo,
                        lte: today,
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            }
        }
    });


    return {
        transactions: userWithTransactions?.Transaction ?? [],
        balance: Number(userWithTransactions?.balance.toString()) ?? 0
    };
}

export async function createTransaction(
    title: string,
    amount: number,
    type: $Enums.TransactionType,
    date: Date,
    userId: string,
    category: string
) {


    return await prisma.$transaction(async (tx) => {

        const newTransaction = await tx.transaction.create({
            data: {
                title,
                amount,
                type,
                userId,
                category,
                date,
            },
        });


        const user = await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [type === 'income' ? 'increment' : 'decrement']: amount
                },
            },
        });


        return { transaction: newTransaction, balance: user.balance };
    });
}




export async function deleteTransaction(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {

        const transactionToDelete = await tx.transaction.findUnique({
            where: {
                id: id,
                userId: userId,
            },
        });

        if (!transactionToDelete) {
            throw new Error("Transaction not found or unauthorized");
        }


        await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [transactionToDelete.type === 'income' ? 'decrement' : 'increment']: transactionToDelete.amount
                },
            },
        });


        const deletedTransaction = await tx.transaction.delete({
            where: { id: transactionToDelete.id },
        });

        return deletedTransaction;
    });
}




export async function updateTransaction(id: string, userId: string, updatedData: {
    title?: string,
    amount?: number,
    type?: $Enums.TransactionType,
    category?: string
}) {
    return await prisma.$transaction(async (tx) => {

        const originalTransaction = await tx.transaction.findUnique({
            where: {
                id: id,
                userId: userId,
            },
        });

        if (!originalTransaction) {
            throw new Error("Transaction not found or unauthorized");
        }


        await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [originalTransaction.type === 'income' ? 'decrement' : 'increment']: originalTransaction.amount
                },
            },
        });


        const updatedTransaction = await tx.transaction.update({
            where: { id: id },
            data: updatedData,
        });


        const user = await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [updatedTransaction.type === 'income' ? 'increment' : 'decrement']: updatedTransaction.amount
                },
            },
        });

        return { transaction: updatedTransaction, balance: user.balance };
    });
}