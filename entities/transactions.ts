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
                    date: 'desc', // Opcional: ordena as transações da mais recente para a mais antiga
                },
            }
        }
    })

}

export async function getTransactionsByMonth(userId: string): Promise<{ transactions: ITransaction[], balance: number }> {
    // 1. Obtém a data atual
    const today = new Date();

    // 2. Define o primeiro dia do mês atual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 3. Busca as transações do usuário no intervalo de datas
    const userWithTransactions = await prisma.users.findFirst({
        where: {
            id: userId
        },
        include: {
            Transaction: {
                where: {
                    userId: userId,
                    date: {
                        gte: firstDayOfMonth, // gte = greater than or equal to (maior ou igual a)
                        lte: today,           // lte = less than or equal to (menor ou igual a)
                    },
                },
                orderBy: {
                    date: 'desc', // Opcional: ordena as transações da mais recente para a mais antiga
                },
            }
        }
    })


    return { transactions: userWithTransactions?.Transaction ?? [], balance: Number(userWithTransactions?.balance.toString()) ?? 0 };
}

export async function getTransactionsLastSixMonths(userId: string): Promise<{ transactions: ITransaction[], balance: number }> {
    // 1. Obtém a data atual
    const today = new Date();

    // 2. Define a data de 6 meses atrás
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // 3. Busca o usuário e as transações no intervalo de datas
    const userWithTransactions = await prisma.users.findUnique({
        where: {
            id: userId
        },
        include: {
            Transaction: {
                where: {
                    userId: userId,
                    date: {
                        gte: sixMonthsAgo, // gte = maior ou igual a
                        lte: today,         // lte = menor ou igual a
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            }
        }
    });

    // 4. Retorna as transações e o saldo do usuário
    return {
        transactions: userWithTransactions?.Transaction ?? [],
        balance: Number(userWithTransactions?.balance.toString()) ?? 0
    };
}

export async function updateTransaction(id: string, userId: string, updatedData: {
    title?: string,
    amount?: number,
    type?: $Enums.TransactionType,
    category?: string
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
    category: string
) {
    return await prisma.transaction.create({
        data: {
            title,
            amount,
            type,
            userId,
            category,
            date,
        },
    });
}
