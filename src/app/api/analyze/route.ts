import { NextRequest, NextResponse } from "next/server";
import { analyzeReport } from "@/lib/geminiClient";
import { auth } from "@/lib/auth";
import {
  validatePdfUpload,
  isValidPdfMagic,
  sanitizePdfText,
  checkAnalysisRateLimit,
  secureLog,
} from "@/lib/security";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (user-based if authenticated, IP-based if anonymous)
    const session = await auth();
    const rateLimitResponse = await checkAnalysisRateLimit(request, session?.user?.id);
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    // Validate file
    const validation = validatePdfUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es muy grande. Máximo 10MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic bytes check for PDFs
    if (file.type === "application/pdf" && !isValidPdfMagic(buffer)) {
      return NextResponse.json({ error: "El archivo no parece ser un PDF válido." }, { status: 400 });
    }

    // Check for empty PDF before sending to Gemini
    if (buffer.length < 100) {
      return NextResponse.json(
        { error: "El archivo está vacío o no contiene datos legibles." },
        { status: 400 }
      );
    }

    secureLog("info", "ANALYZE_START", {
      userId: session?.user?.id || "anonymous",
      fileSize: file.size,
      fileType: file.type,
    });

    // Enviamos el archivo directo a Gemini. Gemini extrae el texto y lo analiza internamente.
    let result;
    try {
      result = await analyzeReport(buffer, file.type, undefined, sanitizePdfText);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      secureLog("error", "ANALYZE_GEMINI_ERROR", {
        userId: session?.user?.id || "anonymous",
        error: message.substring(0, 200),
      });

      if (message.includes("API_KEY") || message.includes("not found") || message.includes("quota")) {
        return NextResponse.json(
          { error: "Error al procesar con la IA. Intentalo de nuevo más tarde." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "No pudimos analizar el informe. Intentalo de nuevo." },
        { status: 500 }
      );
    }

    secureLog("info", "ANALYZE_SUCCESS", {
      userId: session?.user?.id || "anonymous",
      fileSize: file.size,
    });

    return NextResponse.json(result);
  } catch (error) {
    secureLog("error", "ANALYZE_UNEXPECTED", {
      error: error instanceof Error ? error.message.substring(0, 200) : "unknown",
    });
    return NextResponse.json(
      { error: "Ocurrió un error inesperado. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
