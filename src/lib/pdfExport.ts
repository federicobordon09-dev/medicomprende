import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { StudyWithAnalysis } from "./types";

const COLORS = {
  primary: rgb(0.11, 0.12, 0.15),
  secondary: rgb(0.44, 0.47, 0.56),
  muted: rgb(0.63, 0.66, 0.73),
  accent: rgb(0.82, 0.27, 0.23),
  border: rgb(0.89, 0.91, 0.94),
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
};

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawWrappedText(
  page: any,
  text: string,
  font: any,
  fontSize: number,
  x: number,
  y: number,
  maxWidth: number,
  lineGap: number = 4
): number {
  const lines = wrapText(text, font, fontSize, maxWidth);
  for (const line of lines) {
    if (y < 50) {
      return y;
    }
    page.drawText(line, { x, y, font, size: fontSize, color: COLORS.secondary });
    y -= fontSize + lineGap;
  }
  return y;
}

export async function generateAnalysisPdf(study: StudyWithAnalysis): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function addPageIfNeeded(requiredSpace: number) {
    if (y - requiredSpace < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  page.drawText("MediComprende", {
    x: margin,
    y,
    font: helveticaBold,
    size: 22,
    color: COLORS.primary,
  });
  y -= 28;

  page.drawText("Análisis de informe médico generado con IA", {
    x: margin,
    y,
    font: helvetica,
    size: 10,
    color: COLORS.secondary,
  });
  y -= 14;

  page.drawText(`Paciente: ${study.profile?.name || "General"}`, {
    x: margin,
    y,
    font: helvetica,
    size: 10,
    color: COLORS.secondary,
  });
  y -= 14;

  page.drawText(`Estudio: ${study.title}`, {
    x: margin,
    y,
    font: helvetica,
    size: 10,
    color: COLORS.secondary,
  });
  y -= 14;

  page.drawText(`Tipo: ${study.studyType || "No especificado"}`, {
    x: margin,
    y,
    font: helvetica,
    size: 10,
    color: COLORS.secondary,
  });
  y -= 14;

  if (study.studyDate) {
    page.drawText(
      `Fecha del estudio: ${new Date(study.studyDate).toLocaleDateString("es-AR")}`,
      { x: margin, y, font: helvetica, size: 10, color: COLORS.secondary }
    );
    y -= 14;
  }

  page.drawText(
    `Analizado el: ${new Date(study.createdAt).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    { x: margin, y, font: helvetica, size: 10, color: COLORS.secondary }
  );
  y -= 24;

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: COLORS.border,
  });
  y -= 20;

  const analysis = study.analysis;
  if (!analysis) {
    page.drawText("Este estudio aún no tiene análisis disponible.", {
      x: margin,
      y,
      font: helvetica,
      size: 12,
      color: rgb(0.9, 0.24, 0.24),
    });
    const bytes = await doc.save();
    return Buffer.from(bytes);
  }

  addPageIfNeeded(50);
  page.drawText("Resumen", { x: margin, y, font: helveticaBold, size: 14, color: COLORS.primary });
  y -= 22;
  y = drawWrappedText(page, analysis.summary, helvetica, 10, margin, y, contentWidth, 4);
  y -= 16;

  if (analysis.outOfRangeValues && analysis.outOfRangeValues.length > 0) {
    addPageIfNeeded(100);
    y -= 8;
    page.drawText("Valores fuera de rango", {
      x: margin,
      y,
      font: helveticaBold,
      size: 14,
      color: COLORS.primary,
    });
    y -= 22;

    for (const v of analysis.outOfRangeValues) {
      addPageIfNeeded(50);
      page.drawText(`${v.parameter}: ${v.value}`, {
        x: margin,
        y,
        font: helveticaBold,
        size: 10,
        color: COLORS.primary,
      });
      y -= 14;

      page.drawText(`Rango de referencia: ${v.referenceRange}`, {
        x: margin,
        y,
        font: helvetica,
        size: 9,
        color: COLORS.muted,
      });
      y -= 12;

      y = drawWrappedText(page, v.explanation, helveticaOblique, 9, margin, y, contentWidth, 4);
      y -= 12;
    }
  }

  if (analysis.findings && analysis.findings.length > 0) {
    addPageIfNeeded(100);
    y -= 8;
    page.drawText("Hallazgos principales", {
      x: margin,
      y,
      font: helveticaBold,
      size: 14,
      color: COLORS.primary,
    });
    y -= 22;

    for (const f of analysis.findings) {
      addPageIfNeeded(60);
      page.drawText("Original:", {
        x: margin,
        y,
        font: helveticaBold,
        size: 9,
        color: COLORS.secondary,
      });
      y -= 12;

      y = drawWrappedText(page, f.original, helveticaOblique, 9, margin + 10, y, contentWidth - 10, 4);
      y -= 6;

      page.drawText("En palabras simples:", {
        x: margin,
        y,
        font: helveticaBold,
        size: 9,
        color: COLORS.secondary,
      });
      y -= 12;

      y = drawWrappedText(page, f.simplified, helvetica, 9, margin + 10, y, contentWidth - 10, 4);
      y -= 10;
    }
  }

  if (analysis.medicalTerms && analysis.medicalTerms.length > 0) {
    addPageIfNeeded(100);
    y -= 8;
    page.drawText("Términos médicos", {
      x: margin,
      y,
      font: helveticaBold,
      size: 14,
      color: COLORS.primary,
    });
    y -= 22;

    for (const t of analysis.medicalTerms) {
      addPageIfNeeded(40);
      page.drawText(t.term, {
        x: margin,
        y,
        font: helveticaBold,
        size: 9,
        color: COLORS.primary,
      });
      y -= 12;

      y = drawWrappedText(page, t.definition, helvetica, 9, margin + 10, y, contentWidth - 10, 4);
      y -= 8;
    }
  }

  if (analysis.overallInterpretation) {
    addPageIfNeeded(80);
    y -= 8;
    page.drawText("Interpretación general", {
      x: margin,
      y,
      font: helveticaBold,
      size: 14,
      color: COLORS.primary,
    });
    y -= 22;

    y = drawWrappedText(page, analysis.overallInterpretation, helvetica, 10, margin, y, contentWidth, 4);
    y -= 16;
  }

  addPageIfNeeded(60);
  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: COLORS.border,
  });
  y -= 16;

  const disclaimerText =
    "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico para interpretar tus resultados.";

  drawWrappedText(page, disclaimerText, helveticaOblique, 8, margin, y, contentWidth, 2);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
