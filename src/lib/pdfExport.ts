import PDFDocument from "pdfkit";
import type { StudyWithAnalysis } from "./types";

export async function generateAnalysisPdf(study: StudyWithAnalysis): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Análisis - ${study.title}`,
        Author: "MediComprende",
        Subject: "Análisis de informe médico",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const leftMargin = 50;
    const pageWidth = doc.page.width - leftMargin - 50;
    let y = 50;

    // Header
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#1a202c")
      .text("MediComprende", leftMargin, y, { width: pageWidth });
    y += 32;

    doc.font("Helvetica").fontSize(10).fillColor("#718096")
      .text("Análisis de informe médico generado con IA", leftMargin, y);
    y += 14;
    doc.text(`Paciente: ${study.profile?.name || "General"}`, leftMargin, y);
    y += 14;
    doc.text(`Estudio: ${study.title}`, leftMargin, y);
    y += 14;
    doc.text(`Tipo: ${study.studyType || "No especificado"}`, leftMargin, y);
    y += 14;
    if (study.studyDate) {
      doc.text(`Fecha del estudio: ${new Date(study.studyDate).toLocaleDateString("es-AR")}`, leftMargin, y);
      y += 14;
    }
    doc.text(`Analizado el: ${new Date(study.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`, leftMargin, y);
    y += 30;

    // Separator
    doc.moveTo(leftMargin, y).lineTo(leftMargin + pageWidth, y).strokeColor("#e2e8f0").stroke();
    y += 20;

    const analysis = study.analysis;
    if (!analysis) {
      doc.font("Helvetica").fontSize(12).fillColor("#e53e3e")
        .text("Este estudio aún no tiene análisis disponible.", leftMargin, y);
      doc.end();
      return;
    }

    // Summary
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#2d3748")
      .text("Resumen", leftMargin, y);
    y += 22;
    doc.font("Helvetica").fontSize(10).fillColor("#4a5568")
      .text(analysis.summary, leftMargin, y, {
        width: pageWidth,
        align: "justify",
        lineGap: 4,
      });
    y = doc.y + 20;

    // Out of Range Values
    if (analysis.outOfRangeValues && analysis.outOfRangeValues.length > 0) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor("#2d3748")
        .text("Valores fuera de rango", leftMargin, y);
      y += 22;

      for (const v of analysis.outOfRangeValues) {
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#2d3748")
          .text(`${v.parameter}: ${v.value}`, leftMargin, y);
        y += 14;
        doc.font("Helvetica").fontSize(9).fillColor("#718096")
          .text(`Rango de referencia: ${v.referenceRange}`, leftMargin, y);
        y += 12;
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#4a5568")
          .text(v.explanation, leftMargin, y, { width: pageWidth, align: "justify" });
        y = doc.y + 16;
      }
    }

    // Findings
    if (analysis.findings && analysis.findings.length > 0) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor("#2d3748")
        .text("Hallazgos principales", leftMargin, y);
      y += 22;

      for (const f of analysis.findings) {
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#4a5568")
          .text("Original:", leftMargin, y);
        y += 12;
        doc.font("Helvetica-Oblique").fontSize(9).fillColor("#718096")
          .text(f.original, leftMargin + 10, y, { width: pageWidth - 10, align: "justify" });
        y = doc.y + 8;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#4a5568")
          .text("En palabras simples:", leftMargin, y);
        y += 12;
        doc.font("Helvetica").fontSize(9).fillColor("#4a5568")
          .text(f.simplified, leftMargin + 10, y, { width: pageWidth - 10, align: "justify" });
        y = doc.y + 14;
      }
    }

    // Medical Terms
    if (analysis.medicalTerms && analysis.medicalTerms.length > 0) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor("#2d3748")
        .text("Términos médicos", leftMargin, y);
      y += 22;

      for (const t of analysis.medicalTerms) {
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#4a5568")
          .text(t.term, leftMargin, y);
        y += 12;
        doc.font("Helvetica").fontSize(9).fillColor("#718096")
          .text(t.definition, leftMargin + 10, y, { width: pageWidth - 10, align: "justify" });
        y = doc.y + 10;
      }
    }

    // Overall Interpretation
    if (analysis.overallInterpretation) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor("#2d3748")
        .text("Interpretación general", leftMargin, y);
      y += 22;
      doc.font("Helvetica").fontSize(10).fillColor("#4a5568")
        .text(analysis.overallInterpretation, leftMargin, y, {
          width: pageWidth,
          align: "justify",
          lineGap: 4,
        });
      y = doc.y + 20;
    }

    // Disclaimer
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    doc.moveTo(leftMargin, y).lineTo(leftMargin + pageWidth, y).strokeColor("#e2e8f0").stroke();
    y += 16;

    doc.font("Helvetica-Oblique").fontSize(8).fillColor("#a0aec0")
      .text(
        "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, " +
        "recomendación ni reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico " +
        "para interpretar tus resultados.",
        leftMargin, y,
        { width: pageWidth, align: "justify", lineGap: 2 }
      );

    doc.end();
  });
}
