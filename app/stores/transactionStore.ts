// store/transactionsStore.ts

import { ICreateTransactionBody, ITransaction, IUpdateTransactionBody } from '@/types/transactions';
import { create } from 'zustand';

// Função auxiliar para calcular o resumo.
// É chamada em todas as ações que modificam as transações.
const calculateSummaryData = (transactions: ITransaction[], balance?: number) => {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filtra as transações para incluir apenas as do mês e ano atuais
    const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    // Agora, percorre apenas as transações filtradas
    currentMonthTransactions.forEach(t => {
        if (t.type === 'income') {
            monthlyIncome += t.amount;
        } else {
            monthlyExpenses += t.amount;
        }
    });

    const totalBalance = balance ?? 0;
    console.log(`balance era ${balance} e total e ${totalBalance}`)
    const savings = monthlyIncome - monthlyExpenses

    return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings,
    };
};

interface SummaryData {
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    savings: number
}

interface TransactionsState {
    transactions: ITransaction[];
    summaryData: SummaryData,
    loading: boolean;
    error: string | null;
    hasExpense: boolean;

    fetchTransactions: () => Promise<void>;
    fetchLastSixMonthsTransactions: () => Promise<void>,
    addTransaction: (newTransaction: ICreateTransactionBody) => Promise<void>;
    updateTransaction: (id: string, updatedData: IUpdateTransactionBody) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
    transactions: [],
    loading: true,
    hasExpense: false,
    error: null,
    summaryData: {
        monthlyExpenses: 0,
        monthlyIncome: 0,
        savings: 0,
        totalBalance: 0
    },

    // Ação para buscar transações e calcular o resumo
    fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
            console.log("start fetchTransactions")
            const res = await fetch('/api/transactions?filter=6-last-month');
            if (!res.ok) {
                console.log("deu erro")
                throw new Error('Falha ao buscar transações.');
            }
            console.log("Passou do res ok")
            const data = await res.json();
            console.log(data)
            const transactions = data.transactions.transactions as ITransaction[];
            const balance = data.transactions.balance as number

            // Calcula o resumo dos dados recebidos
            const summaryData = calculateSummaryData(transactions, balance);
            if (summaryData.monthlyExpenses != 0) {
                set({ hasExpense: true })
            }
            console.log("calculou o summary data")
            console.log(summaryData)
            // Seta as transações e o resumo em um único estado
            set({ transactions, loading: false, summaryData });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchLastSixMonthsTransactions: async () => {

        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/transactions?filter=6-last-month');
            if (!res.ok) throw new Error('Falha ao buscar transações dos últimos 6 meses.');
            const data = await res.json();
            set({ transactions: data.transactions.transactions, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },
    // Ação para adicionar transação e atualizar o resumo
    addTransaction: async (newTransaction) => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction),
        });

        if (res.ok) {
            const data = await res.json();
            const createdTransaction = data.transaction as ITransaction;

            // Pega o estado atual das transações e adiciona a nova
            const updatedTransactions = [createdTransaction, ...get().transactions];
            const summaryData = calculateSummaryData(updatedTransactions);

            set({
                transactions: updatedTransactions,
                summaryData,
            });
        } else {
            set({ error: 'Falha ao adicionar transação.' });
        }
    },

    // Ação para deletar transação e atualizar o resumo
    deleteTransaction: async (id) => {
        const res = await fetch('/api/transactions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            const updatedTransactions = get().transactions.filter(t => t.id !== id);
            const summaryData = calculateSummaryData(updatedTransactions);

            set({
                transactions: updatedTransactions,
                summaryData,
            });
        } else {
            set({ error: 'Falha ao apagar transação.' });
        }
    },

    // Ação para atualizar transação e recalcular o resumo
    updateTransaction: async (id, updatedData) => {
        try {
            const res = await fetch('/api/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updatedData }),
            });

            if (!res.ok) {
                throw new Error('Falha ao atualizar transação.');
            }

            const data = await res.json();
            const updatedTransaction = data.transaction as ITransaction;

            const updatedTransactions = get().transactions.map(t =>
                t.id === id ? updatedTransaction : t
            );
            const summaryData = calculateSummaryData(updatedTransactions);

            set({
                transactions: updatedTransactions,
                summaryData,
            });

        } catch (error) {
            set({ error: (error as Error).message });
        }
    }
}));