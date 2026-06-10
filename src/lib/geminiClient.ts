import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ReportResult } from "./types";
import { z } from "zod";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "La clave de API de Gemini no está configurada. " +
        "Creá un archivo .env.local con: GEMINI_API_KEY=tu-key"
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const FindingSchema = z.object({
  original: z.string().min(1),
  simplified: z.string().min(1),
});

const MedicalTermSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
});

const ReportResultSchema = z.object({
  summary: z.string().min(1),
  findings: z.array(FindingSchema).default([]),
  medicalTerms: z.array(MedicalTermSchema).default([]),
  overallInterpretation: z.string().default(""),
});

const SYSTEM_PROMPT = `
Actuás como "MediComprende", un asistente médico educativo amigable y cálido.
Recibís el texto de un informe médico en español. Tu objetivo es traducir la información a lenguaje claro y cotidiano, usando español rioplatense con voseo.

Devuelve SOLO un objeto JSON sin texto adicional, sin markdown, sin código de bloque. Solo el JSON plano.

Estructura exacta requerida:
{
  "summary": "Resumen de 3-4 oraciones en lenguaje simple y cálido explicando de qué trata el informe.",
  "findings": [
    {
      "original": "Texto exacto del hallazgo tal como aparece en el informe",
      "simplified": "Explicación en palabras cotidianas y simples"
    }
  ],
  "medicalTerms": [
    {
      "term": "Término médico encontrado",
      "definition": "Definición simple y clara para cualquier persona"
    }
  ],
  "overallInterpretation": "Interpretación general del estado descripto en el informe, en lenguaje claro, sin alarmar"
}

IMPORTANTE:
- No inventes información que no esté en el texto del informe.
- Si algo no está claro o no se entiende, decilo honestamente.
- No des diagnósticos ni recomendaciones médicas.
- No uses tono alarmista. Sé tranquilizador pero objetivo.
- Usá "vos" y "tenés" (español rioplatense con voseo).
- Si el informe no tiene hallazgos relevantes, indicá que está dentro de parámetros normales.
`;

export async function analyzeReport(text: string): Promise<ReportResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\n---\n\n${text}`;

  let rawText: string;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    rawText = response.text();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Gemini: ${err.message}`);
    }
    throw new Error("Error de conexión con la IA.");
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("La IA no devolvió contenido. El informe podría estar vacío o ser ilegible.");
  }

  const cleanedText = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    console.error("JSON parse error. Raw response:", rawText.substring(0, 500));
    throw new Error("La IA devolvió una respuesta inesperada. Intentalo de nuevo.");
  }

  const validation = ReportResultSchema.safeParse(parsed);

  if (!validation.success) {
    console.error("Validation error:", validation.error.flatten());
    throw new Error("La IA devolvió una respuesta con formato incorrecto. Intentalo de nuevo.");
  }

  const data = validation.data;

  return {
    summary: data.summary,
    findings: data.findings,
    medicalTerms: data.medicalTerms,
    overallInterpretation: data.overallInterpretation,
    disclaimer: "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico para interpretar tus resultados.",
  };
}
