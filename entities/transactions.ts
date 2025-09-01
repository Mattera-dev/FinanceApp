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

export async function createTransaction(
    title: string,
    amount: number,
    type: $Enums.TransactionType,
    date: Date,
    userId: string,
    category: string
) {
    // Usamos $transaction para garantir que ambas as operações sejam atômicas.
    // Se uma falhar, a outra também será revertida.
    return await prisma.$transaction(async (tx) => {
        // 1. Cria a nova transação
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

        // 2. Atualiza o saldo do usuário
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

// ===================================
// Função para DELETAR uma Transação
// ===================================
export async function deleteTransaction(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
        // 1. Encontra a transação antes de deletar
        const transactionToDelete = await tx.transaction.findUnique({
            where: {
                id: id,
                userId: userId, // Garante que a transação pertence ao usuário
            },
        });

        if (!transactionToDelete) {
            throw new Error("Transaction not found or unauthorized");
        }

        // 2. Reverte a alteração no saldo do usuário
        await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [transactionToDelete.type === 'income' ? 'decrement' : 'increment']: transactionToDelete.amount
                },
            },
        });

        // 3. Deleta a transação
        const deletedTransaction = await tx.transaction.delete({
            where: { id: transactionToDelete.id },
        });

        return deletedTransaction;
    });
}

// ===================================
// Função para ATUALIZAR uma Transação
// ===================================
export async function updateTransaction(id: string, userId: string, updatedData: {
    title?: string,
    amount?: number,
    type?: $Enums.TransactionType,
    category?: string
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Encontra a transação original para reverter o saldo
        const originalTransaction = await tx.transaction.findUnique({
            where: {
                id: id,
                userId: userId,
            },
        });

        if (!originalTransaction) {
            throw new Error("Transaction not found or unauthorized");
        }

        // 2. Reverte o saldo da transação original
        await tx.users.update({
            where: { id: userId },
            data: {
                balance: {
                    [originalTransaction.type === 'income' ? 'decrement' : 'increment']: originalTransaction.amount
                },
            },
        });

        // 3. Atualiza a transação com os novos dados
        const updatedTransaction = await tx.transaction.update({
            where: { id: id },
            data: updatedData,
        });

        // 4. Aplica o novo saldo
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