import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuario — no revelar si existe o no (seguridad)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Generar token seguro de 32 bytes
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Guardar token en DB (invalida cualquier token anterior)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expiry,
        },
      });

      // Enviar email (fire-and-forget — no bloqueamos la respuesta)
      sendPasswordResetEmail(normalizedEmail, token).catch((err) => {
        console.error("[forgot-password] Error sending email:", err);
      });
    }

    // Siempre devolver éxito
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
