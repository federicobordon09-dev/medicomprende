import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AlertResult } from "./types";
import { z } from "zod";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

const SingleAlertSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]),
  parameter: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  trend: z.enum(["increasing", "decreasing", "unstable"]),
});

const AlertResultSchema = z.object({
  alerts: z.array(SingleAlertSchema).default([]),
});

const ALERTS_PROMPT = `
Actuás como "MediComprende", un asistente médico educativo especializado en detectar patrones de salud.
Recibís el historial de estudios médicos de un paciente y debés identificar patrones preocupantes.

Devuelve SOLO un objeto JSON sin texto adicional.

Estructura exacta:
{
  "alerts": [
    {
      "type": "glucose_elevation" | "cholesterol_increase" | "hemoglobin_decrease" | "blood_pressure_elevation" | "kidney_function_decline" | "liver_enzyme_elevation" | "inflammatory_marker_increase" | "general_worsening",
      "severity": "info" | "warning" | "critical",
      "parameter": "Nombre del parámetro con tendencia",
      "title": "Título descriptivo de la alerta",
      "description": "Descripción clara y tranquilizadora de lo que se observa, recomendando consultar al médico",
      "trend": "increasing" | "decreasing" | "unstable"
    }
  ]
}

IMPORTANTE:
- Solo generá alertas cuando haya suficiente evidencia en los estudios.
- No generes alertas falsas. Si no hay patrones claros, devolvé {"alerts": []}.
- Las alertas deben ser tranquilizadoras pero informativas.
- Nunca uses lenguaje alarmista. Siempre recomendá consultar con un profesional.
- Usá español rioplatense con voseo.`;

export async function detectAlerts(studiesHistoryText: string): Promise<AlertResult> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  });

  const prompt = `${ALERTS_PROMPT}\n\n---\n\nHistorial de estudios del paciente:\n${studiesHistoryText}`;

  const result = await model.generateContent(prompt);
  let rawText = result.response.text();
  rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(rawText);
  const validated = AlertResultSchema.parse(parsed);
  return validated;
}
