import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";

function createTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }

  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, message, contact } = body;

    if (!type || !message || typeof message !== "string") {
      return NextResponse.json({ error: "Completá todos los campos requeridos." }, { status: 400 });
    }

    if (!["Bug", "Sugerencia", "Idea"].includes(type)) {
      return NextResponse.json({ error: "Tipo de mensaje inválido." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "El mensaje debe tener al menos 10 caracteres." }, { status: 400 });
    }

    const transport = createTransport();
    const emailHtml = `
      <h2>Nuevo feedback - MediComprende</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif">
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Usuario</td><td style="padding:8px 12px;border:1px solid #ddd">${session.user.name || "—"} (${session.user.email || "—"})</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Tipo</td><td style="padding:8px 12px;border:1px solid #ddd">${type}</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Contacto</td><td style="padding:8px 12px;border:1px solid #ddd">${contact || "—"}</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd;vertical-align:top">Mensaje</td><td style="padding:8px 12px;border:1px solid #ddd">${message.replace(/\n/g, "<br>")}</td></tr>
      </table>
    `;

    if (transport) {
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: "federicobordon.dev@gmail.com",
        subject: `[MediComprende Feedback] ${type} de ${session.user.name || session.user.email}`,
        html: emailHtml,
      });
    } else {
      console.log("=== FEEDBACK (no SMTP configured) ===");
      console.log("From:", session.user.email);
      console.log("Type:", type);
      console.log("Message:", message);
      console.log("Contact:", contact);
      console.log("======================================");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Error al enviar tu mensaje. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
