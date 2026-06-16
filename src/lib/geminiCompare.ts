import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ComparisonResult } from "./types";
import { z } from "zod";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const ChangeSchema = z.object({
  parameter: z.string().min(1),
  previousValue: z.string().min(1),
  currentValue: z.string().min(1),
  change: z.enum(["aumentó", "disminuyó", "se mantuvo"]),
  significance: z.enum(["mejora", "empeoramiento", "estable"]),
  explanation: z.string().min(1),
});

const TrendSchema = z.object({
  parameter: z.string().min(1),
  values: z.array(z.string()),
  trend: z.enum(["mejorando", "empeorando", "estable"]),
  warning: z.string().nullable().optional(),
});

const ComparisonResultSchema = z.object({
  summary: z.string().min(1),
  changes: z.array(ChangeSchema).default([]),
  trends: z.array(TrendSchema).default([]),
  overallAssessment: z.string().min(1),
  recommendations: z.array(z.string()).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
});

const COMPARE_PROMPT = `
Actuás como "MediComprende", un asistente médico educativo especializado en comparar estudios médicos.
Recibís dos o más análisis de estudios médicos del mismo paciente. Tu objetivo es compararlos y detectar cambios.

Devuelve SOLO un objeto JSON sin texto adicional.

Estructura exacta:
{
  "summary": "Resumen general de los cambios entre los estudios",
  "changes": [
    {
      "parameter": "Nombre del parámetro",
      "previousValue": "Valor en el estudio anterior",
      "currentValue": "Valor en el estudio más reciente",
      "change": "aumentó" | "disminuyó" | "se mantuvo",
      "significance": "mejora" | "empeoramiento" | "estable",
      "explanation": "Qué significa este cambio en palabras simples"
    }
  ],
  "trends": [
    {
      "parameter": "Nombre del parámetro con tendencia",
      "values": ["Valor1", "Valor2", "Valor3"],
      "trend": "mejorando" | "empeorando" | "estable",
      "warning": "Alerta opcional si la tendencia es preocupante"
    }
  ],
  "overallAssessment": "Evaluación general de la evolución",
  "recommendations": ["Recomendación 1", "Recomendación 2"],
  "suggestedQuestions": ["Pregunta 1", "Pregunta 2"]
}

IMPORTANTE:
- No inventes información que no esté en los análisis proporcionados.
- No des diagnósticos ni recomendaciones médicas específicas.
- Si no hay datos suficientes para comparar, decilo honestamente.
- Usá "vos" y "tenés" (español rioplatense con voseo).
- Siempre aclará que la información es educativa.
- MANTENÉ LA RESPUESTA CORTA y CONCISA. No uses más de 4000 caracteres.
- El JSON debe estar COMPLETO y BIEN FORMADO. No cortes strings con saltos de línea ni dejes objetos/arrays sin cerrar.`;

export async function compareStudies(analysesText: string): Promise<ComparisonResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
  });

  const prompt = `${COMPARE_PROMPT}\n\n---\n\nAnálisis de estudios a comparar:\n${analysesText}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("La IA no devolvió contenido.");
  }

  const cleanedText = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  function repairJson(s: string): string {
    s = s.trim();
    let inString = false;
    let escape = false;
    const stack: string[] = [];
    let repaired = "";
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      repaired += ch;
      if (escape) { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{" || ch === "[") stack.push(ch);
      else if (ch === "}") { if (stack[stack.length - 1] === "{") stack.pop(); }
      else if (ch === "]") { if (stack[stack.length - 1] === "[") stack.pop(); }
    }
    while (stack.length > 0) {
      const open = stack.pop();
      repaired += open === "{" ? "}" : "]";
    }
    return repaired;
  }

  let parsed: unknown;
  let attemptText = cleanedText;
  try {
    parsed = JSON.parse(attemptText);
  } catch {
    try {
      attemptText = repairJson(attemptText);
      parsed = JSON.parse(attemptText);
    } catch {
      console.error("JSON parse error. Raw response:", rawText.substring(0, 500));
      throw new Error("La IA devolvió una respuesta inesperada. Intentalo de nuevo.");
    }
  }

  const validated = ComparisonResultSchema.parse(parsed);
  return validated;
}
