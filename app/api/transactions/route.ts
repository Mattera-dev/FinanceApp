import { createTransaction, deleteTransaction, getTransactionsById, getTransactionsByMonth, getTransactionsLastSixMonths, updateTransaction } from "@/entities/transactions";
import { getDataFromToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // Ex: '?filter=monthly'

    try {
        let transactions;

        if (filter === 'monthly') {
            // Busca apenas as transações do mês no banco de dados
            transactions = await getTransactionsByMonth(userData.id);
        } else if (filter === "6-last-month") {
            transactions = await getTransactionsLastSixMonths(userData.id)
        } else {
            transactions = await getTransactionsById(userData.id);
        }

        return NextResponse.json({ transactions }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Failed to get transactions" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, amount, type, date, category } = await req.json();

        if (!title || !amount || !type || !date || !category) {
            return NextResponse.json({ message: "Bad Request" }, { status: 400 });
        }

        const newTransaction = await createTransaction(title, amount, type, date, userData.id, category);

        return NextResponse.json({ message: "Transaction created successfully", transaction: newTransaction.transaction, balance: Number(newTransaction.balance) }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to create transaction" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, updatedData } = await req.json();

        if (!id || !updatedData) {
            return NextResponse.json({ message: "ID and data are required" }, { status: 400 });
        }

        delete updatedData.id
        // Garanta que o usuário só possa alterar suas próprias transações
        const updatedTransaction = await updateTransaction(id, userData.id, updatedData);

        if (!updatedTransaction) {
            return NextResponse.json({ message: "Transaction not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Transaction updated successfully", transaction: updatedTransaction.transaction, balance: Number(updatedTransaction.balance) }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to update transaction" }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        const deletedTransaction = await deleteTransaction(id, userData.id);

        if (!deletedTransaction) {
            return NextResponse.json({ message: "Transaction not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Transaction deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
    }
}