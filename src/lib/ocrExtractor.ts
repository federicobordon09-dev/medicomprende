import path from "path";
import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

function resolveWorkerPath(): string {
  return path.join(
    process.cwd(),
    "node_modules",
    "tesseract.js",
    "src",
    "worker-script",
    "node",
    "index.js"
  );
}

async function getWorker() {
  if (!worker) {
    worker = await createWorker("spa", undefined, {
      workerPath: resolveWorkerPath(),
    });
  }
  return worker;
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data } = await w.recognize(buffer);
  const text = data.text.trim();
  if (text.length < 20) {
    throw new Error("No se pudo extraer texto suficiente de la imagen.");
  }
  return text;
}
