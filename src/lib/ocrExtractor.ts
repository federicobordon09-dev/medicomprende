/**
 * Extrae texto de una imagen usando OCR (Tesseract.js).
 *
 * IMPORTANTE: tesseract.js se importa DINÁMICAMENTE dentro de la función.
 * Esto evita que su worker thread se inicie al cargar el módulo, lo cual
 * causaba uncaught exceptions en entornos serverless (Vercel). En Vercel
 * esta función falla rápidamente sin llegar a importar tesseract.js.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  // Fast-fail si estamos en Vercel serverless (Tesseract.js no funciona)
  if (process.env.VERCEL === "1") {
    throw new Error(
      "El reconocimiento óptico (OCR) no está disponible en Vercel. Probá con un PDF que tenga texto seleccionable."
    );
  }

  // Lazy import: tesseract.js solo se carga CUANDO se llama esta función,
  // no al cargar el módulo. Esto evita worker threads colgados en serverless.
  type TesseractModule = typeof import("tesseract.js");
  let createWorker: TesseractModule["createWorker"];
  try {
    createWorker = (await import("tesseract.js")).createWorker;
  } catch {
    throw new Error(
      "El motor OCR no está disponible. Instalá tesseract.js o usá un PDF con texto seleccionable."
    );
  }

  // Timeout para evitar que el worker cuele en serverless
  const workerPromise = createWorker("spa");
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("OCR_TIMEOUT")), 8000);
  });

  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    worker = await Promise.race([workerPromise, timeout]);
  } catch {
    throw new Error(
      "El reconocimiento óptico (OCR) no está disponible en este entorno. Probá con un PDF que tenga texto seleccionable."
    );
  }

  try {
    const { data } = await worker.recognize(buffer);
    const text = data.text.trim();
    if (text.length < 20) {
      throw new Error("No se pudo extraer texto suficiente de la imagen.");
    }
    return text;
  } finally {
    // Siempre terminar el worker para no acumular procesos colgados
    try {
      await worker.terminate();
    } catch {
      // Si falla al terminar, ignoramos (el proceso se limpia solo en serverless)
    }
  }
}
