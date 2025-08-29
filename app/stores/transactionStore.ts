// store/transactionsStore.ts

import { ICreateTransactionBody, ITransaction, IUpdateTransactionBody } from '@/types/transactions';
import { create } from 'zustand';

interface TransactionsState {
    transactions: ITransaction[];
    loading: boolean;
    error: string | null;

    fetchTransactions: () => Promise<void>;
    addTransaction: (newTransaction: ICreateTransactionBody) => Promise<void>;
    updateTransaction: (id: string, updatedData: IUpdateTransactionBody) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
    transactions: [],
    loading: false,
    error: null,

    fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/transactions');
            if (!res.ok) {
                throw new Error('Falha ao buscar transações.');
            }
            const data = await res.json();
            set({ transactions: data.transactions, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addTransaction: async (newTransaction) => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction),
        });

        if (res.ok) {
            const data = await res.json();
            const createdTransaction = data.transaction as ITransaction;

            set(state => ({
                transactions: [createdTransaction, ...state.transactions],
            }));
        } else {
            set({ error: 'Falha ao adicionar transação.' });
        }
    },

    deleteTransaction: async (id) => {
        const res = await fetch('/api/transactions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            set(state => ({
                transactions: state.transactions.filter(t => t.id !== id),
            }));
        } else {
            set({ error: 'Falha ao apagar transação.' });
        }
    },
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

            // Atualiza a transação na lista do store
            set(state => ({
                transactions: state.transactions.map(t =>
                    t.id === id ? updatedTransaction : t
                ),
            }));

        } catch (error) {
            set({ error: (error as Error).message });
        }
    }
}));
