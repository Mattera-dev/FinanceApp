import { TransactionType } from "@/lib/generated/prisma";

export interface ITransaction {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    date: Date;
    userId: string;
    category: string
}

export interface ICreateTransactionBody {
    title: string;
    amount: number;
    category: string,
    type: TransactionType;
    date: Date;
}

export interface IUpdateTransactionBody {
    id: string;
    title?: string;
    amount?: number;
    category?: string,
    type?: TransactionType;
    date?: Date;
}

export const expenseCategories = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Saúde",
    "Educação",
    "Roupas",
    "Outros",
]

export const incomeCategories = ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"]

export interface Transaction {
    id: string
    type: "income" | "expense"
    amount: number
    category: string
    description: string
    date: string
}