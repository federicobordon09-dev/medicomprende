import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import { analyzeReport } from "@/lib/geminiClient";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000;

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const PDF_MAGIC = Buffer.from("%PDF");

function isValidPdf(buffer: Buffer): boolean {
  return buffer.slice(0, 4).equals(PDF_MAGIC);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Esperá un minuto antes de intentar de nuevo." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es muy grande. Máximo 10MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isValidPdf(buffer)) {
      return NextResponse.json({ error: "El archivo no parece ser un PDF válido." }, { status: 400 });
    }

    let text: string;
    try {
      text = await extractTextFromPdf(buffer);
    } catch {
      return NextResponse.json(
        { error: "No pudimos leer el PDF. Asegurate de que tenga texto seleccionable (no escaneado)." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "El PDF parece estar vacío o ser una imagen escaneada. Necesitamos texto seleccionable." },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await analyzeReport(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      console.error("Gemini analysis error:", message);
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

    return NextResponse.json(result);
  } catch {
    console.error("Unexpected error in /api/analyze");
    return NextResponse.json(
      { error: "Ocurrió un error inesperado. Intentalo de nuevo." },
      { status: 500 }
    );
  }
}
