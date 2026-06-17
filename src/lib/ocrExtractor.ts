import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker("spa");
  }
  return worker;
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const w = await getWorker();
    const { data } = await w.recognize(buffer);
    const text = data.text.trim();
    if (text.length < 20) {
      throw new Error("No se pudo extraer texto suficiente de la imagen.");
    }
    return text;
  } catch (e) {
    // Tesseract.js puede fallar en entornos serverless (Vercel) por
    // incompatibilidad con workers nativos. Devolvemos un error claro.
    if (e instanceof Error && (e.message.includes("Cannot find module") || e.message.includes("MODULE_NOT_FOUND"))) {
      throw new Error(
        "El reconocimiento óptico (OCR) no está disponible en este entorno. Probá con un PDF que tenga texto seleccionable."
      );
    }
    throw e;
  }
}
