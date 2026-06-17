import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

/** Crea o reusa un worker Tesseract con timeout para evitar hangs en serverless */
async function getWorker(timeoutMs = 8000): Promise<Awaited<ReturnType<typeof createWorker>>> {
  if (worker) return worker;

  // Tesseract.js lanza uncaught exceptions dentro del worker thread que
  // nunca rechazan la Promise. Usamos Promise.race con un timeout.
  const workerPromise = createWorker("spa");
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("OCR_TIMEOUT")), timeoutMs);
  });

  try {
    worker = await Promise.race([workerPromise, timeout]);
    return worker;
  } catch (e) {
    worker = null; // resetear para reintentos futuros
    throw e;
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  // Fast-fail si estamos en Vercel serverless (Tesseract.js no funciona)
  if (process.env.VERCEL === "1") {
    throw new Error(
      "El reconocimiento óptico (OCR) no está disponible en Vercel. Probá con un PDF que tenga texto seleccionable."
    );
  }

  try {
    const w = await getWorker();
    const { data } = await w.recognize(buffer);
    const text = data.text.trim();
    if (text.length < 20) {
      throw new Error("No se pudo extraer texto suficiente de la imagen.");
    }
    return text;
  } catch (e) {
    // Tesseract.js puede fallar en entornos serverless por
    // incompatibilidad con workers nativos. Devolvemos un error claro.
    const msg = e instanceof Error ? e.message : "";
    if (
      msg.includes("Cannot find module") ||
      msg.includes("MODULE_NOT_FOUND") ||
      msg === "OCR_TIMEOUT"
    ) {
      throw new Error(
        "El reconocimiento óptico (OCR) no está disponible en este entorno. Probá con un PDF que tenga texto seleccionable."
      );
    }
    throw e;
  }
}
