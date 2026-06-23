import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-response";
import { ValidationError } from "@/lib/api-error";
import { FeedbackSchema, secureLog } from "@/lib/security";
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
  try {
    const session = await requireAuth();

    const body = await request.json();

    const validation = FeedbackSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Datos inválidos";
      throw new ValidationError(firstError);
    }

    const { type, message, contact } = body;
    const feedbackType = type as string;

    if (!["Sugerencia", "Reportar error"].includes(feedbackType)) {
      throw new ValidationError("Tipo de mensaje inválido.");
    }

    const transport = createTransport();
    const emailHtml = `
      <h2>Nuevo feedback - MediComprende</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif">
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Usuario</td><td style="padding:8px 12px;border:1px solid #ddd">${session.user.name || "—"} (${session.user.email || "—"})</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Tipo</td><td style="padding:8px 12px;border:1px solid #ddd">${feedbackType}</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd">Contacto</td><td style="padding:8px 12px;border:1px solid #ddd">${contact || "—"}</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;border:1px solid #ddd;vertical-align:top">Mensaje</td><td style="padding:8px 12px;border:1px solid #ddd">${message.replace(/\n/g, "<br>")}</td></tr>
      </table>
    `;

    if (transport) {
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: "federicobordon.dev@gmail.com",
        subject: `[MediComprende Feedback] ${feedbackType} de ${session.user.name || session.user.email}`,
        html: emailHtml,
      });
    } else {
      secureLog("info", "FEEDBACK_RECEIVED", {
        userId: session.user.id,
        type: feedbackType,
      });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
