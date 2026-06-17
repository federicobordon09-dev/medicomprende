import PDFParser from "pdf2json";

function decodeText(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

/** Extraer texto usando pdf2json (rápido, PDFs con texto seleccionable) */
function extractWithPdf2json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (err) => {
      const msg =
        err && "parserError" in err
          ? err.parserError.message
          : err instanceof Error
            ? err.message
            : "formato no soportado";
      reject(new Error(msg));
    });

    parser.on("pdfParser_dataReady", (data) => {
      try {
        const text = data.Pages.map((page) =>
          page.Texts.map((t) =>
            t.R.map((r) => decodeText(r.T)).join(" ")
          ).join(" ")
        ).join("\n\n");
        resolve(text);
      } catch {
        reject(new Error("Error al procesar el texto del PDF."));
      }
    });

    parser.parseBuffer(buffer);
  });
}

/** Extraer texto usando pdf-parse v2 (mozilla pdf.js, más tolerante con formatos raros) */
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  // pdf-parse v2 exporta PDFParse como clase (named export), no default
  const { PDFParse } = await import("pdf-parse");
  const pdf = new PDFParse(new Uint8Array(buffer));
  const result = await pdf.getText();
  await pdf.destroy();
  return result.text || "";
}

/**
 * Intenta extraer texto de un PDF.
 * Primero prueba pdf2json (rápido).
 * Si falla (XRef inválido, formato no soportado), prueba pdf-parse.
 * Si ambos fallan, lanza error.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // 1er intento: pdf2json
  try {
    return await extractWithPdf2json(buffer);
  } catch {
    // 2do intento: pdf-parse (más robusto)
  }

  const text = await extractWithPdfParse(buffer);
  if (!text || text.trim().length < 20) {
    throw new Error(
      "No pudimos leer el texto del PDF. Probá con un PDF que tenga texto seleccionable (no escaneado)."
    );
  }
  return text;
}
