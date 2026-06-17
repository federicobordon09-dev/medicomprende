import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "MediComprende <onboarding@resend.dev>";

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablecé tu contraseña en MediComprende",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF8F6;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 16px;">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <tr>
                <td style="padding:40px 32px 32px;">
                  <h1 style="font-size:22px;font-weight:700;color:#1E3A8A;margin:0 0 8px;">
                    Restablecé tu contraseña
                  </h1>
                  <p style="font-size:15px;color:#4A443E;line-height:1.5;margin:0 0 24px;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta en MediComprende.
                  Hacé clic en el botón para crear una nueva:
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                    <tr>
                      <td align="center" style="background:#4F46E5;border-radius:12px;padding:0;">
                        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;white-space:nowrap;">
                          Restablecer contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size:13px;color:#80776B;line-height:1.5;margin:0 0 16px;">
                    Si el botón no funciona, copiá este link en tu navegador:
                  </p>
                  <p style="font-size:12px;color:#80776B;word-break:break-all;background:#F3F0EC;border-radius:8px;padding:12px;margin:0;">
                    ${resetUrl}
                  </p>
                  <hr style="border:none;border-top:1px solid #E8E3DC;margin:24px 0;">
                  <p style="font-size:12px;color:#B8AFA2;margin:0;">
                    Este link expira en <strong>1 hora</strong>. Si no solicitaste restablecer tu contraseña, podés ignorar este email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;text-align:center;">
                  <p style="font-size:11px;color:#B8AFA2;margin:0;">MediComprende — Tu salud en palabras simples</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error("[email] Error sending password reset:", error);
    throw new Error("Error al enviar el email.");
  }
}
