import PDFParser from "pdf2json";

function decodeText(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (err) => {
      const msg =
        err && "parserError" in err
          ? err.parserError.message
          : err instanceof Error
            ? err.message
            : "formato no soportado";
      reject(new Error(`No pudimos leer el PDF: ${msg}`));
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
