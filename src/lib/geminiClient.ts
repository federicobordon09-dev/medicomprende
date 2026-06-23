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
  original: z.string().min(1).catch(""),
  simplified: z.string().min(1).catch(""),
});

const MedicalTermSchema = z.object({
  term: z.string().min(1).catch(""),
  definition: z.string().min(1).catch(""),
});

const OutOfRangeSchema = z.object({
  parameter: z.string().min(1).catch("Parámetro desconocido"),
  value: z.string().min(1).catch(""),
  referenceRange: z.string().min(1).catch(""),
  status: z.enum(["elevado", "disminuido", "borderline", "normal"]).catch("normal"),
  explanation: z.string().min(1).catch(""),
});

const ParameterExplanationSchema = z.object({
  parameter: z.string().min(1).catch(""),
  value: z.string().min(1).catch(""),
  explanation: z.string().min(1).catch(""),
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
Recibís el texto de un informe médico en español (puede ser PDF, imagen escaneada, etc.). Tu objetivo es traducir la información a lenguaje claro y cotidiano, usando español rioplatense con voseo.

PRIMERO: Identificá el tipo de informe médico:
- "laboratorio" → análisis de sangre, orina, heces, etc. (tablas con parámetros, valores y rangos)
- "imagen" → resonancia, tomografía, radiografía, ecografía, mamografía (texto descriptivo)
- "electrocardiograma" → estudio cardíaco con ondas y mediciones
- "epicrisis" → resumen clínico de alta hospitalaria
- "otro" → cualquier otro tipo

SEGUNDO: Según el tipo de informe, enfocate en extraer lo siguiente:

LABORATORIO → outOfRangeValues COMPLEto con CADA parámetro + parameterExplanations para cada uno
IMAGEN → findings DETALLADOS describiendo cada hallazgo visual + medicalTerms
EPICRISIS → summary COMPLETO + findings + medicalTerms
ECG → findings + overallInterpretation
OTRO → usá lo que corresponda del JSON

Devuelve SOLO un objeto JSON sin texto adicional, sin markdown, sin código de bloque. Solo el JSON plano.

Estructura exacta requerida:
{
  "summary": "Resumen de 3-4 oraciones en lenguaje simple y cálido explicando de qué trata el informe.",
  "outOfRangeValues": [
    {
      "parameter": "Nombre exacto del parámetro o indicador",
      "value": "Valor reportado exacto (incluí la unidad de medida SIEMPRE, ej: '165 mg/dL')",
      "referenceRange": "Rango de referencia tal como aparece en el informe (ej: '70-100 mg/dL' o '< 150 mg/dL'). Si no aparece en el texto, poné 'No especificado'",
      "status": "elevado" | "disminuido" | "borderline" | "normal",
      "explanation": "Explicación específica de este valor: decí si está normal, alto o bajo y qué implicancia TIENE ESE VALOR EXACTO (ej: 'Tu glucosa está en 110, apenas por arriba del máximo de 100, lo que se llama glucemia alterada en ayunas')"
    }
  ],
  "parameterExplanations": [
    {
      "parameter": "Nombre exacto del parámetro (IDÉNTICO al de outOfRangeValues)",
      "value": "Mismo valor que en outOfRangeValues (incluí unidad de medida)",
      "explanation": "Explicación EDUCATIVA de qué mide este parámetro, qué significa el valor específico del paciente y por qué es importante. Diferenciá de la explicación en outOfRangeValues: acá explicas el QUÉ y POR QUÉ del parámetro en sí (ej: 'La glucosa en sangre mide la cantidad de azúcar circulante. Tu valor de 110 mg/dL está levemente elevado, lo que puede indicar que tu cuerpo no está procesando el azúcar de manera óptima. Mantenerla controlada es importante para prevenir diabetes y complicaciones cardiovasculares.')",
      "possibleCauses": [
        "Causa 1 concreta y específica basada en el valor (ej: 'HbA1c elevada puede indicar prediabetes o diabetes tipo 2')",
        "Causa 2 si aplica"
      ]
    }
  ],
  "findings": [
    {
      "original": "TEXTO EXACTO del hallazgo como aparece en el informe (copiado textual, sin modificar)",
      "simplified": "Explicación en palabras cotidianas y simples de ESE hallazgo específico"
    }
  ],
  "medicalTerms": [
    {
      "term": "Término médico encontrado textualmente en el informe",
      "definition": "Definición simple y clara para cualquier persona, en español rioplatense"
    }
  ],
  "overallInterpretation": "Interpretación general del estado descripto en el informe, en lenguaje claro, sin alarmar. Integrá los hallazgos principales",
  "possibleCauses": ["Causa general 1 extraída del informe textualmente", "Causa general 2 basada exclusivamente en lo que dice el informe"],
  "recommendations": [
    "Recomendación basada en lo que sugiere el informe textualmente",
    "Recordatorio de consultar con un profesional para interpretación completa"
  ],
  "suggestedQuestions": [
    "Pregunta 1 basada en los hallazgos del informe",
    "Pregunta 2 basada en los hallazgos del informe",
    "Pregunta 3 general sobre seguimiento"
  ]
}

REGLAS ABSOLUTAS PARA "outOfRangeValues":
👉 SOLO PARA informes de LABORATORIO (sangre, orina, etc.):
- TODOS los parámetros de laboratorio deben aparecer acá. Cada fila = un item.
- Incluí TAMBIÉN valores normales. El usuario necesita ver TODO su estudio.
- Si ves "H", "L", "↑", "↓", "*", "ALTO", "BAJO", "++" junto a un valor, usalo para determinar status.
- Si el valor está justo en el límite del rango, usá "borderline".
- Extraé SIEMPRE la unidad de medida del texto (mg/dL, UI/L, % , etc.).
- Si el rango de referencia dice "< 150", el valor de referencia es ese.
- Si el informe NO es de laboratorio (es una resonancia, tomografía, etc.), pone este array vacío [].

👉 PROHIBIDO: omitir parámetros "porque son muchos". Extraé TODOS.

REGLAS ABSOLUTAS PARA "parameterExplanations":
👉 Esta es la regla MÁS IMPORTANTE: parameterExplanations DEBE tener EXACTAMENTE la misma cantidad de items que outOfRangeValues, con los mismos "parameter" (nombre exacto).
- Por cada item en outOfRangeValues → UN item en parameterExplanations.
- La explicación en outOfRangeValues se enfoca en el VALOR (está alto/bajo/normal).
- La explicación en parameterExplanations se enfoca en el PARÁMETRO (qué mide, por qué importa).
- No importa si el valor es normal: IGUAL tenés que explicar el parámetro.
- Si el informe NO es de laboratorio, poné este array vacío [].

👉 PROHIBIDO: devolver frases como "No hay parámetros adicionales para explicar", "Todos los valores están dentro de lo normal", "Sin hallazgos relevantes", "No se requieren explicaciones adicionales", "Sin parámetros para explicar". Si outOfRangeValues tiene items, parameterExplanations DEBE tener la misma cantidad.

IMPORTANTE:
- EXTRAÉ SOLO lo que está ESCRITO en el informe. NO inventes valores, NO inventes parámetros, NO inventes resultados.
- Si no encontrás un valor o rango en el texto, NO lo inventes. Poné "No especificado".
- Si el texto es confuso o ilegible, decilo honestamente en el summary.
- Si ves una tabla con filas, CADA FILA es un parámetro en outOfRangeValues.
- Si ves texto descriptivo (ej: "Se observa imagen hipointensa en T2"), eso va en findings.
- Jamás des diagnósticos categóricos. Usá "puede indicar", "sugiere", "es compatible con".
- No uses tono alarmista. Sé tranquilizador pero objetivo.
- Usá SIEMPRE "vos" y "tenés" (español rioplatense con voseo).
- El JSON debe estar COMPLETO y BIEN FORMADO.
- MÁXIMO 8000 caracteres en total.

REGLAS PARA "possibleCauses":
- Causas CONCRETAS y basadas en el valor del parámetro, no genéricas.
- Prioridad 1: causa del texto del informe.
- Prioridad 2: asociación clínica directa (ej: HbA1c > 6.5% → diabetes, Ferritina baja → anemia ferropénica).
- PROHIBIDO: "dieta", "estilo de vida", "genética", "factores genéticos", "falta de ejercicio", "herencia", "sedentarismo" como causa única.
- Máximo 2 causas por parámetro. Si no hay información suficiente: ["No especificado en el informe"].

EJEMPLO DE EXTRACCIÓN COMPLETA (LABORATORIO):
Informe: "Glucosa: 110 mg/dL (VR: 70-100) ↑ | Colesterol total: 220 mg/dL (VR: <200) H | HDL: 45 mg/dL (VR: >40) | LDL: 150 mg/dL (VR: <130) H | Triglicéridos: 130 mg/dL (VR: <150)"
Salida esperada:
"outOfRangeValues": [
  { "parameter": "Glucosa", "value": "110 mg/dL", "referenceRange": "70-100 mg/dL", "status": "elevado", "explanation": "Tu glucosa está en 110 mg/dL, por arriba del máximo normal de 100. Esto se llama glucemia alterada en ayunas y puede ser una señal de alerta temprana." },
  { "parameter": "Colesterol total", "value": "220 mg/dL", "referenceRange": "< 200 mg/dL", "status": "elevado", "explanation": "Tu colesterol total de 220 está por encima de los 200 recomendados. Esto aumenta el riesgo de acumulación de placa en las arterias." },
  { "parameter": "HDL", "value": "45 mg/dL", "referenceRange": "> 40 mg/dL", "status": "normal", "explanation": "Tu colesterol HDL (el 'bueno') está en 45, dentro del rango normal. El HDL ayuda a eliminar el exceso de colesterol." },
  { "parameter": "LDL", "value": "150 mg/dL", "referenceRange": "< 130 mg/dL", "status": "elevado", "explanation": "Tu LDL (colesterol 'malo') está en 150, por encima de 130. El LDL alto contribuye a la formación de placas en las arterias." },
  { "parameter": "Triglicéridos", "value": "130 mg/dL", "referenceRange": "< 150 mg/dL", "status": "normal", "explanation": "Tus triglicéridos están en 130, dentro del rango normal. Los triglicéridos son un tipo de grasa que el cuerpo usa como energía." }
],
"parameterExplanations": [
  { "parameter": "Glucosa", "value": "110 mg/dL", "explanation": "La glucosa en sangre mide la cantidad de azúcar circulante. Tu valor de 110 mg/dL está levemente elevado, lo que puede indicar que tu cuerpo no está procesando el azúcar de manera óptima. Mantenerla controlada es importante para prevenir diabetes y complicaciones cardiovasculares.", "possibleCauses": ["Prediabetes o resistencia a la insulina"] },
  { "parameter": "Colesterol total", "value": "220 mg/dL", "explanation": "El colesterol total mide la suma de todo el colesterol en tu sangre, incluyendo LDL y HDL. Un valor elevado aumenta el riesgo de enfermedades cardiovasculares.", "possibleCauses": ["Hipercolesterolemia", "Dieta alta en grasas saturadas"] },
  { "parameter": "HDL", "value": "45 mg/dL", "explanation": "El HDL es conocido como el 'colesterol bueno' porque ayuda a transportar el exceso de colesterol de vuelta al hígado para ser eliminado. Tu valor está dentro de lo normal, lo cual es favorable.", "possibleCauses": ["No especificado en el informe"] },
  { "parameter": "LDL", "value": "150 mg/dL", "explanation": "El LDL o 'colesterol malo' transporta colesterol desde el hígado a las células. Cuando está elevado, puede acumularse en las paredes arteriales formando placas que dificultan la circulación.", "possibleCauses": ["Hipercolesterolemia familiar o adquirida"] },
  { "parameter": "Triglicéridos", "value": "130 mg/dL", "explanation": "Los triglicéridos son un tipo de grasa que el cuerpo almacena como reserva de energía. Tu valor está dentro del rango normal, lo que sugiere un metabolismo lipídico adecuado.", "possibleCauses": ["No especificado en el informe"] }
]

EJEMPLO DE EXTRACCIÓN (IMAGEN - Resonancia):
Informe: "RMN de columna lumbar: Disminución de la altura del disco L4-L5 con señal compatible con deshidratación. Leve protrusión discal posterior sin compromiso radicular."
Salida esperada:
"outOfRangeValues": [],
"parameterExplanations": [],
"findings": [
  { "original": "Disminución de la altura del disco L4-L5 con señal compatible con deshidratación", "simplified": "El disco entre la cuarta y quinta vértebra lumbar está más fino de lo normal y tiene menos contenido de agua, lo que es típico del desgaste natural." },
  { "original": "Leve protrusión discal posterior sin compromiso radicular", "simplified": "Hay un leve abultamiento del disco hacia atrás, pero no está presionando ningún nervio, por lo que probablemente no cause dolor en las piernas." }
]
`;

/**
 * Analiza un estudio médico con Gemini.
 *
 * @param textOrBuffer - Texto extraído del informe, o buffer con el archivo original
 * @param mimeType - Obligatorio si se pasa un buffer: MIME type del archivo (application/pdf, image/jpeg, etc.)
 * @param plan - Plan del usuario ('free' | 'pro'), afecta el modelo usado
 *
 * Cuando se pasa un buffer, Gemini recibe el archivo directo via inlineData
 * y extrae el texto + lo analiza en un solo paso. No necesita OCR ni extracción previa.
 */
export async function analyzeReport(
  textOrBuffer: string | Buffer,
  mimeType?: string,
  plan: "free" | "pro" = "free",
  sanitizeFn?: (text: string) => string
): Promise<ReportResultV2> {
  const client = getClient();
  const modelName = plan === "pro"
    ? (process.env.GEMINI_PRO_MODEL || "gemini-2.5-flash")
    : (process.env.GEMINI_MODEL || "gemini-2.5-flash-lite");
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.15,
      topP: 0.95,
      maxOutputTokens: 32768,
    },
  });

  let rawText: string;
  if (typeof textOrBuffer !== "string") {
    // Modo archivo: intentamos mandar el PDF/imagen directo a Gemini via inlineData.
    // Gemini intenta extraer el texto y analizarlo internamente.
    // Si falla (PDFs no soportados inline por algunos modelos), hacemos fallback a texto extraído.
    const base64Data = textOrBuffer.toString("base64");
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType || "application/pdf",
            data: base64Data,
          },
        },
        { text: SYSTEM_PROMPT_V2 },
      ]);
      rawText = result.response.text();
    } catch (inlineErr) {
      // Si es un error de cuota (429), no tiene sentido reintentar con texto
      // porque el fallback también va a pegar a Gemini y fallar igual.
      const inlineMsg = inlineErr instanceof Error ? inlineErr.message : "";
      if (inlineMsg.includes("429") || inlineMsg.includes("quota") || inlineMsg.includes("RATE_LIMIT")) {
        throw new Error(`Gemini: ${inlineMsg}`);
      }

      // Si Gemini rechazó el archivo inline (PDF no soportado), intentamos extraer texto con pdf-parse
      // y mandar el texto (funciona para cualquier PDF con texto seleccionable).
      console.warn("Inline file submission failed, falling back to text extraction:", inlineMsg);
      try {
        const { extractTextFromPdf } = await import("@/lib/pdfExtractor");
        let extractedText = await extractTextFromPdf(textOrBuffer);
        if (sanitizeFn) {
          extractedText = sanitizeFn(extractedText);
        }
        if (extractedText.trim().length < 50) {
          throw new Error("El PDF no contiene suficiente texto legible. Asegurate de que sea un PDF digital, no escaneado.");
        }
        const result = await model.generateContent(`${SYSTEM_PROMPT_V2}\n\n---\n\n${extractedText}`);
        rawText = result.response.text();
      } catch (textErr) {
        // Ambos métodos fallaron. Devolvemos el error del inline (más descriptivo)
        if (inlineErr instanceof Error) {
          throw new Error(`Gemini: ${inlineErr.message}`);
        }
        throw new Error("Error de conexión con la IA.");
      }
    }
  } else {
    // Modo texto: mandamos el texto extraído directamente
    let text = textOrBuffer as string;
    if (sanitizeFn) {
      text = sanitizeFn(text);
    }
    if (text.trim().length < 50) {
      throw new Error("El PDF no contiene suficiente texto legible. Asegurate de que sea un PDF digital, no escaneado.");
    }
    const result = await model.generateContent(`${SYSTEM_PROMPT_V2}\n\n---\n\n${text}`);
    rawText = result.response.text();
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

  // Sanitizar: filtrar items incompletos en arrays antes de validar
  // La IA a veces devuelve objetos sin campos requeridos
  function sanitizeGeminiResponse(data: unknown): unknown {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data;

    const obj = { ...(data as Record<string, unknown>) };

    const arrayFields: Record<string, string[]> = {
      medicalTerms: ["term"],
      findings: ["original"],
      outOfRangeValues: ["parameter"],
      parameterExplanations: ["parameter"],
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
        console.warn(
          `[Gemini] Filtrados ${before - after} item(s) inválidos de "${key}" durante sanitización`
        );
      }
    }

    return obj;
  }

  parsed = sanitizeGeminiResponse(parsed);

  const validation = ReportResultV2Schema.safeParse(parsed);

  if (!validation.success) {
    console.error("Validation error (incluso después de sanitizar):", validation.error.flatten());
    throw new Error("La IA devolvió una respuesta con formato incorrecto. Intentalo de nuevo.");
  }

  let data = validation.data;

  if (data.outOfRangeValues.length > 0 && data.parameterExplanations.length === 0) {
    data.parameterExplanations = data.outOfRangeValues.map((v) => ({
      parameter: v.parameter,
      value: v.value,
      explanation: v.explanation,
      possibleCauses: [],
    }));
    console.warn("[Gemini] Fallback: parameterExplanations generado desde outOfRangeValues");
  }

  if (data.outOfRangeValues.length !== data.parameterExplanations.length) {
    const paramMap = new Map(data.parameterExplanations.map((p) => [p.parameter, p]));
    data.parameterExplanations = data.outOfRangeValues.map((v) => {
      const existing = paramMap.get(v.parameter);
      return existing || {
        parameter: v.parameter,
        value: v.value,
        explanation: v.explanation,
        possibleCauses: [],
      };
    });
    console.warn("[Gemini] Fallback: parameterExplanations rellenado para coincidir con outOfRangeValues");
  }

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
    summary: z.string().min(1).catch(""),
    findings: z.array(FindingSchema).default([]),
    medicalTerms: z.array(MedicalTermSchema).default([]),
    overallInterpretation: z.string().default(""),
  }).parse(parsed);

  return {
    ...validated,
    disclaimer: "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud.",
  };
}
