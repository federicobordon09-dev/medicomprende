import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // Buscar usuario sin revelar si existe o no (seguridad)
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      // TODO: Generar reset token, enviar email
      // Por ahora solo registramos la solicitud
      console.log(`[forgot-password] Solicitud para: ${email}`);
    }

    // Siempre devolver éxito — no revelar si el email existe
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
