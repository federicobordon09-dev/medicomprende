import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const SYSTEM_PROMPT = `
Actuás como "MediComprende", un asistente conversacional médico educativo.

REGLAS ESTRICTAS:
1. Nunca emitas diagnósticos definitivos.
2. Nunca indiques tratamientos específicos.
3. Siempre aclará que la información es educativa y no sustituye la consulta médica.
4. Usá exclusivamente el contexto de los estudios del usuario para responder.
5. Si no sabés la respuesta, decí: "No tengo información suficiente en tus estudios para responder eso. Consultá a tu médico."
6. Si el usuario pide un diagnóstico, respondé: "No puedo dar diagnósticos. Solo puedo ayudarte a entender tus estudios. Consultá a tu médico."
7. Usá español rioplatense con voseo ("vos", "tenés").
8. Sé cálido, paciente y tranquilizador.
9. Si mencionás valores de estudios, siempre citá la fuente ("según tu estudio del [fecha]").

CONTEXTO DE ESTUDIOS DEL USUARIO:
{context}

Historial de la conversación:
{history}
`;

export async function chatWithContext(
  message: string,
  context: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  });

  const historyText = history
    .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
    .join("\n");

  const prompt = SYSTEM_PROMPT
    .replace("{context}", context)
    .replace("{history}", historyText || "No hay historial previo.")
    + `\n\nUsuario: ${message}\nAsistente:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function* chatWithContextStreaming(
  message: string,
  context: string,
  history: { role: "user" | "assistant"; content: string }[]
): AsyncGenerator<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  });

  const historyText = history
    .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
    .join("\n");

  const prompt = SYSTEM_PROMPT
    .replace("{context}", context)
    .replace("{history}", historyText || "No hay historial previo.")
    + `\n\nUsuario: ${message}\nAsistente:`;

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
