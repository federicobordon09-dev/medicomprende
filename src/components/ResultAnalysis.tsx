"use client";

import type { ReportResult } from "@/lib/types";
import { result } from "@/data/contenido";
import FindingsList from "./FindingsList";
import MedicalTermsGrid from "./MedicalTermsGrid";

interface Props {
  result: ReportResult;
}

export default function ResultAnalysis({ result: data }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-sk-800 to-sk-950 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-xl text-white">{result.summaryTitle}</h3>
        </div>
        <p className="text-base leading-relaxed text-sk-100">{data.summary}</p>
      </div>

      {data.overallInterpretation && (
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-mint-400 to-mint-600 rounded-l-full" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-warm-950">Interpretación general</h3>
          </div>
          <p className="text-base leading-relaxed text-warm-800">{data.overallInterpretation}</p>
        </div>
      )}

      {data.findings && data.findings.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D04C3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-warm-950">{result.findingsTitle}</h3>
          </div>
          <FindingsList findings={data.findings} />
        </div>
      )}

      {data.medicalTerms && data.medicalTerms.length > 0 && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-sk-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M09.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-xl text-warm-950">{result.termsTitle}</h3>
          </div>
          <MedicalTermsGrid terms={data.medicalTerms} />
        </div>
      )}
    </div>
  );
}
