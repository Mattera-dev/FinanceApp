import { ICreateTransactionBody, ITransaction, IUpdateTransactionBody } from '@/types/transactions';
import { toast } from 'sonner';
import { create } from 'zustand';

const calculateSummaryData = (transactions: ITransaction[], balance?: number) => {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    currentMonthTransactions.forEach(t => {
        if (t.type === 'income') {
            monthlyIncome += t.amount;
        } else {
            monthlyExpenses += t.amount;
        }
    });

    const totalBalance = balance ?? 0;
    const savings = monthlyIncome - monthlyExpenses;

    return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings,
    };
};

interface SummaryData {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savings: number;
}

interface TransactionsState {
    transactions: ITransaction[];
    summaryData: SummaryData;
    loading: boolean;
    error: string | null;
    hasExpense: boolean;

    fetchTransactions: () => Promise<void>;
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
        totalBalance: 0,
    },

    fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/transactions?filter=6-last-month');
            if (!res.ok) {
                throw new Error('Falha ao buscar transações.');
            }
            const data = await res.json();
            const transactions = data.transactions.transactions as ITransaction[];
            const balance = data.transactions.balance as number;

            const summaryData = calculateSummaryData(transactions, balance);
            if (summaryData.monthlyExpenses !== 0) {
                set({ hasExpense: true });
            }
            set({ transactions, loading: false, summaryData });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addTransaction: async (newTransaction) => {
        newTransaction.amount = newTransaction.amount * 100;
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction),
        });

        if (res.ok) {
            const data = await res.json();
            const createdTransaction = data.transaction as ITransaction;
            const newBalance = data.balance as number;

            const updatedTransactions = [createdTransaction, ...get().transactions];
            const summaryData = calculateSummaryData(updatedTransactions, newBalance);

            set({
                transactions: updatedTransactions,
                summaryData,
            });
            toast.success("Transação adicionada com sucesso!");
        } else {
            set({ error: 'Falha ao adicionar transação.' });
            toast.error('Falha ao adicionar transação.');
        }
    },

    deleteTransaction: async (id) => {
        const res = await fetch('/api/transactions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            const updatedTransactions = get().transactions.filter(t => t.id !== id);
            const data = await res.json();
            const summaryData = calculateSummaryData(updatedTransactions, data.balance);

            set({
                transactions: updatedTransactions,
                summaryData,
            });
            toast.success("Excluído com sucesso!");
        } else {
            set({ error: 'Falha ao apagar transação.' });
            toast.error('Falha ao apagar transação.');
        }
    },

    updateTransaction: async (id, updatedData) => {
        try {
            if (updatedData.amount) {
                updatedData.amount = updatedData.amount * 100;
            }

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
            const newBalance = data.balance as number;

            const updatedTransactions = get().transactions.map(t =>
                t.id === id ? updatedTransaction : t
            );
            const summaryData = calculateSummaryData(updatedTransactions, newBalance);

            set({
                transactions: updatedTransactions,
                summaryData,
            });
            toast.success("Transação atualizada com sucesso!");
        } catch (error) {
            set({ error: (error as Error).message });
            toast.error((error as Error).message);
        }
    },
}));