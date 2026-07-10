import { FindingsList } from "./FindingsList";
import { MedicalTermsGrid } from "./MedicalTermsGrid";
import { result } from "@/data/contenido";

interface Props {
  data: {
    summary: string;
    overallInterpretation?: string;
    findings: any[];
    medicalTerms: any[];
    outOfRangeValues?: any[];
    parameterExplanations?: any[];
    possibleCauses?: string[];
    recommendations?: string[];
    suggestedQuestions?: string[];
    disclaimer?: string;
  };
}

export default function ResultAnalysis({ data }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-ink text-paper brutal-border brutal-shadow p-6 md:p-8">
        <h2 className="font-display font-bold text-xl text-accent uppercase tracking-tight mb-3">Resumen</h2>
        <p className="text-paper/80 font-mono leading-relaxed text-base">{data.summary}</p>
      </div>

      {data.overallInterpretation && (
        <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent text-ink brutal-border-2 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-ink uppercase tracking-tight">Interpretación general</h3>
          </div>
          <p className="text-base font-mono text-ink/70 leading-relaxed">{data.overallInterpretation}</p>
        </div>
      )}

      {data.findings && data.findings.length > 0 && (
        <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-2 text-white brutal-border-2 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-ink uppercase tracking-tight">{result.findingsTitle}</h3>
          </div>
          <FindingsList findings={data.findings} />
        </div>
      )}

      {data.medicalTerms && data.medicalTerms.length > 0 && (
        <div className="bg-white brutal-border-2 brutal-shadow p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ink text-accent brutal-border-2 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-ink uppercase tracking-tight">{result.termsTitle}</h3>
          </div>
          <MedicalTermsGrid terms={data.medicalTerms} />
        </div>
      )}
    </div>
  );
}
