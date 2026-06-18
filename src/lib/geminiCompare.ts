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

function normalizeChange(value: unknown): string {
  const map: Record<string, string> = {
    "aumento": "aumentó",
    "aumenta": "aumentó",
    "subió": "aumentó",
    "subio": "aumentó",
    "incrementó": "aumentó",
    "incremento": "aumentó",
    "disminuyo": "disminuyó",
    "disminuye": "disminuyó",
    "bajó": "disminuyó",
    "bajo": "disminuyó",
    "descendió": "disminuyó",
    "descendio": "disminuyó",
    "redujo": "disminuyó",
    "se mantiene": "se mantuvo",
    "se mantuvo": "se mantuvo",
    "sin cambios": "se mantuvo",
    "estable": "se mantuvo",
    "igual": "se mantuvo",
  };
  if (typeof value !== "string") return "se mantuvo";
  return map[value.toLowerCase().trim()] || value;
}

function normalizeSignificance(value: unknown): string {
  const map: Record<string, string> = {
    "mejora": "mejora",
    "mejoró": "mejora",
    "mejoro": "mejora",
    "mejor": "mejora",
    "empeoramiento": "empeoramiento",
    "empeoró": "empeoramiento",
    "empeoro": "empeoramiento",
    "peor": "empeoramiento",
    "estable": "estable",
    "sin cambio": "estable",
    "sin cambios": "estable",
  };
  if (typeof value !== "string") return "estable";
  return map[value.toLowerCase().trim()] || value;
}

function normalizeTrend(value: unknown): string {
  const map: Record<string, string> = {
    "mejorando": "mejorando",
    "mejora": "mejorando",
    "mejor": "mejorando",
    "empeorando": "empeorando",
    "empeora": "empeorando",
    "peor": "empeorando",
    "estable": "estable",
    "sin cambios": "estable",
    "sin cambio": "estable",
  };
  if (typeof value !== "string") return "estable";
  return map[value.toLowerCase().trim()] || value;
}

const ChangeSchema = z.object({
  parameter: z.string().min(1).catch(""),
  previousValue: z.string().min(1).catch(""),
  currentValue: z.string().min(1).catch(""),
  change: z.preprocess(normalizeChange, z.enum(["aumentó", "disminuyó", "se mantuvo"])).catch("se mantuvo"),
  significance: z.preprocess(normalizeSignificance, z.enum(["mejora", "empeoramiento", "estable"])).catch("estable"),
  explanation: z.string().min(1).catch(""),
});

const TrendSchema = z.object({
  parameter: z.string().min(1).catch(""),
  values: z.array(z.string()).default([]),
  trend: z.preprocess(normalizeTrend, z.enum(["mejorando", "empeorando", "estable"])).catch("estable"),
  warning: z.string().nullable().optional(),
});

const ComparisonResultSchema = z.object({
  summary: z.string().min(1).catch(""),
  changes: z.array(ChangeSchema).default([]),
  trends: z.array(TrendSchema).default([]),
  overallAssessment: z.string().min(1).catch(""),
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

╔══════════════════════════════════════════════════════════════════════╗
║  VALORES EXACTOS — Usá SOLO estos, sin variaciones, sin tildes      ║
║  faltantes, sin sinónimos. Copialos textual.                        ║
╚══════════════════════════════════════════════════════════════════════╝

Campo "change" (solo estos 3 valores exactos):
  → "aumentó"   (no "aumento", no "subió", no "incrementó")
  → "disminuyó" (no "disminuyo", no "bajó", no "descendió")
  → "se mantuvo" (no "se mantiene", no "estable", no "sin cambios")

Campo "significance" (solo estos 3 valores exactos):
  → "mejora"
  → "empeoramiento"
  → "estable"

Campo "trend" (solo estos 3 valores exactos):
  → "mejorando"
  → "empeorando"
  → "estable"

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
    generationConfig: { temperature: 0.15, maxOutputTokens: 16384 },
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

  function sanitizeComparisonResponse(data: unknown): unknown {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data;
    const obj = { ...(data as Record<string, unknown>) };

    const arrayFields: Record<string, string[]> = {
      changes: ["parameter", "change"],
      trends: ["parameter", "trend"],
    };

    for (const [key, requiredFields] of Object.entries(arrayFields)) {
      if (!Array.isArray(obj[key])) continue;
      const before = (obj[key] as unknown[]).length;
      obj[key] = (obj[key] as unknown[]).filter((item) => {
        if (!item || typeof item !== "object") return false;
        return requiredFields.every((f) => {
          const v = (item as Record<string, unknown>)[f];
          return typeof v === "string" && v.trim().length > 0;
        });
      });
      const after = (obj[key] as unknown[]).length;
      if (after < before) {
        console.warn(`[Gemini] Filtrados ${before - after} item(s) inválidos en comparación`);
      }
    }

    return obj;
  }

  parsed = sanitizeComparisonResponse(parsed);

  const validation = ComparisonResultSchema.safeParse(parsed);

  if (!validation.success) {
    console.error("Comparison validation error:", validation.error.flatten());
    throw new Error("La IA devolvió una respuesta con formato incorrecto. Intentalo de nuevo.");
  }

  return validation.data;
}
