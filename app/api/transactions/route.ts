import { createTransaction, deleteTransaction, getTransactionsById, updateTransaction } from "@/entities/transactions";
import { getDataFromToken } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await getTransactionsById(userData.id);

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
        const { title, amount, type, date } = await req.json();

        if (!title || !amount || !type || !date) {
            return NextResponse.json({ message: "Bad Request" }, { status: 400 });
        }

        const newTransaction = await createTransaction(title, amount, type, date, userData.id);

        return NextResponse.json({ message: "Transaction created successfully", transaction: newTransaction }, { status: 201 });
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

        // Garanta que o usuário só possa alterar suas próprias transações
        const updatedTransaction = await updateTransaction(id, userData.id, updatedData);

        if (!updatedTransaction) {
            return NextResponse.json({ message: "Transaction not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Transaction updated successfully", transaction: updatedTransaction }, { status: 200 });
    } catch (error) {
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