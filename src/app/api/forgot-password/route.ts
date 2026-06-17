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

    // Verificar que la API key de Resend esté configurada
    if (!process.env.RESEND_API_KEY) {
      console.error("[forgot-password] RESEND_API_KEY no está configurada");
      return NextResponse.json(
        { error: "El servicio de email no está configurado. Contactá al administrador." },
        { status: 500 }
      );
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

      // Enviar email (await real para detectar errores)
      try {
        await sendPasswordResetEmail(normalizedEmail, token);
        console.log(`[forgot-password] Email enviado a: ${normalizedEmail}`);
      } catch (emailErr) {
        // No devolver error al cliente (seguridad), pero loguearlo
        console.error("[forgot-password] Error enviando email:", emailErr);
      }
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
