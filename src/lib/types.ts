export interface Finding {
  original: string;
  simplified: string;
}

export interface MedicalTerm {
  term: string;
  definition: string;
}

export interface ReportResult {
  summary: string;
  findings: Finding[];
  medicalTerms: MedicalTerm[];
  overallInterpretation: string;
  disclaimer: string;
}

export type PageState = "idle" | "loading" | "result" | "error";
