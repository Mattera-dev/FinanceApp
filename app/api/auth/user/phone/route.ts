import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ message: "O número do telefone é obrigatório" }, { status: 400 });
        }

        await prisma.users.update({
            where: { id: userData.id },
            data: { phone },
        });

        return NextResponse.json({ message: "Telefone atualizado com sucesso" }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar o telefone:", error);
        return NextResponse.json({ message: "Falha ao atualizar o telefone" }, { status: 500 });
    }
}