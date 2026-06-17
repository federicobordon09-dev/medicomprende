import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ResetSchema = z.object({
  token: z.string().min(1, "Token inválido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ResetSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Buscar usuario por token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: "El link de restablecimiento no es válido o ya expiró." },
        { status: 400 }
      );
    }

    // Verificar expiración
    if (user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "El link de restablecimiento expiró. Solicitá uno nuevo." },
        { status: 400 }
      );
    }

    // Actualizar contraseña y limpiar token
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Error al restablecer la contraseña." },
      { status: 500 }
    );
  }
}
