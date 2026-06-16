import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ReportResult, ReportResultV2 } from "./types";
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

const OutOfRangeSchema = z.object({
  parameter: z.string().min(1),
  value: z.string().min(1),
  referenceRange: z.string().min(1),
  status: z.enum(["elevado", "disminuido", "borderline", "normal"]),
  explanation: z.string().min(1),
});

const ParameterExplanationSchema = z.object({
  parameter: z.string().min(1),
  value: z.string().min(1),
  explanation: z.string().min(1),
  possibleCauses: z.array(z.string()).default([]),
});

const ReportResultV2Schema = z.object({
  summary: z.string().min(1),
  outOfRangeValues: z.array(OutOfRangeSchema).default([]),
  parameterExplanations: z.array(ParameterExplanationSchema).default([]),
  findings: z.array(FindingSchema).default([]),
  medicalTerms: z.array(MedicalTermSchema).default([]),
  overallInterpretation: z.string().default(""),
  possibleCauses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
});

const SYSTEM_PROMPT_V2 = `
Actuás como "MediComprende", un asistente médico educativo amigable y cálido.
Recibís el texto de un informe médico en español. Tu objetivo es traducir la información a lenguaje claro y cotidiano, usando español rioplatense con voseo.

Devuelve SOLO un objeto JSON sin texto adicional, sin markdown, sin código de bloque. Solo el JSON plano.

Estructura exacta requerida:
{
  "summary": "Resumen de 3-4 oraciones en lenguaje simple y cálido explicando de qué trata el informe.",
  "outOfRangeValues": [
    {
      "parameter": "Nombre del parámetro o indicador",
      "value": "Valor reportado en el informe",
      "referenceRange": "Rango de referencia normal indicado en el informe",
      "status": "elevado" | "disminuido" | "borderline" | "normal",
      "explanation": "Qué significa este valor en palabras simples"
    }
  ],
  "parameterExplanations": [
    {
      "parameter": "Nombre del parámetro",
      "value": "Valor reportado",
      "explanation": "Qué mide este parámetro y qué significa su valor alterado",
      "possibleCauses": ["Causa posible 1", "Causa posible 2"]
    }
  ],
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
  "overallInterpretation": "Interpretación general del estado descripto en el informe, en lenguaje claro, sin alarmar",
  "possibleCauses": ["Causa general posible 1", "Causa general posible 2"],
  "recommendations": [
    "Considerá consultar con un especialista en...",
    "Podría ser útil repetir el estudio en..."
  ],
  "suggestedQuestions": [
    "¿Debo repetir este estudio?",
    "¿Necesito tratamiento adicional?",
    "¿Debo consultar con un especialista?",
    "¿Qué cambios en el estilo de vida podrían ayudar?"
  ]
}

IMPORTANTE:
- No inventes información que no esté en el texto del informe.
- Si algo no está claro o no se entiende, decilo honestamente.
- No des diagnósticos ni recomendaciones médicas específicas.
- No uses tono alarmista. Sé tranquilizador pero objetivo.
- Usá "vos" y "tenés" (español rioplatense con voseo).
- Si el informe no tiene hallazgos relevantes, indicá que está dentro de parámetros normales.
- Siempre aclará que la información es educativa.
- MANTENÉ LA RESPUESTA CORTA y CONCISA. No uses más de 4000 caracteres.
- El JSON debe estar COMPLETO y BIEN FORMADO. No cortes strings con saltos de línea ni dejes objetos/arrays sin cerrar.`;

export async function analyzeReport(text: string): Promise<ReportResultV2> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  });

  const prompt = `${SYSTEM_PROMPT_V2}\n\n---\n\n${text}`;

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
  let attemptText = cleanedText;

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

  const validation = ReportResultV2Schema.safeParse(parsed);

  if (!validation.success) {
    console.error("Validation error:", validation.error.flatten());
    throw new Error("La IA devolvió una respuesta con formato incorrecto. Intentalo de nuevo.");
  }

  const data = validation.data;

  return {
    ...data,
    disclaimer: "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico para interpretar tus resultados.",
  };
}

// Mantener compatibilidad con V1
export async function analyzeReportV1(text: string): Promise<ReportResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });

  const promptV1 = `
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
- Si el informe no tiene hallazgos relevantes, indicá que está dentro de parámetros normales.`;

  const result = await model.generateContent(`${promptV1}\n\n---\n\n${text}`);
  const rawText = result.response.text();
  const cleanedText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleanedText);
  const validated = z.object({
    summary: z.string().min(1),
    findings: z.array(FindingSchema).default([]),
    medicalTerms: z.array(MedicalTermSchema).default([]),
    overallInterpretation: z.string().default(""),
  }).parse(parsed);

  return {
    ...validated,
    disclaimer: "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud.",
  };
}
