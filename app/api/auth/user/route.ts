import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/utils";
import { getUser } from "@/entities/user";
import { compareSync, hashSync } from "bcrypt";
import prisma from "@/lib/prisma";

const GOOGLE_PASSWORD_PLACEHOLDER = "google_user_no_password_needed!";

export async function DELETE(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    try {
        const { email, password } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email é obrigatório" }, { status: 400 });
        }

        if (email !== userData.email) {
            return NextResponse.json({ message: "As credenciais não correspondem à conta logada." }, { status: 403 });
        }

        const user = await getUser({ email });

        if (!user) {
            return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
        }

        if (user.password !== GOOGLE_PASSWORD_PLACEHOLDER) {
            if (!password) {
                return NextResponse.json({ message: "Senha é obrigatória para esta conta." }, { status: 400 });
            }
            if (!compareSync(password, user.password)) {
                return NextResponse.json({ message: "Senha incorreta" }, { status: 401 });
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: { userId: userData.id },
            });

            await tx.users.delete({
                where: { id: userData.id },
            });
        });

        const res = NextResponse.json({ message: "Conta e transações apagadas com sucesso!" }, { status: 200 });
        res.cookies.delete('auth_token');

        return res;

    } catch (error) {
        console.error("Erro ao apagar conta do usuário:", error);
        return NextResponse.json({ message: "Falha ao apagar a conta" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const userData = await getDataFromToken(req);

    if (!userData) {
        return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!newPassword) {
            return NextResponse.json({ message: "A nova senha é obrigatória" }, { status: 400 });
        }

        const user = await getUser({ email: userData.email });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }
        
        if (user.password !== GOOGLE_PASSWORD_PLACEHOLDER) {
             if (!currentPassword) {
                return NextResponse.json({ message: "A senha atual é obrigatória" }, { status: 400 });
            }
            if (!compareSync(currentPassword, user.password)) {
                return NextResponse.json({ message: "Senha atual incorreta" }, { status: 401 });
            }
        } else if (currentPassword) {
            return NextResponse.json({ message: "Esta conta não possui senha atual." }, { status: 400 });
        }

        const hashedNewPassword = hashSync(newPassword, 10);

        await prisma.users.update({
            where: { id: userData.id },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json({ message: "Senha alterada com sucesso!" }, { status: 200 });

    } catch (error) {
        console.error("Erro ao alterar a senha:", error);
        return NextResponse.json({ message: "Falha ao alterar a senha" }, { status: 500 });
    }
}