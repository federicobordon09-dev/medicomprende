export interface Finding {
  original: string;
  simplified: string;
}

export interface MedicalTerm {
  term: string;
  definition: string;
}

export interface OutOfRangeValue {
  parameter: string;
  value: string;
  referenceRange: string;
  status: "elevado" | "disminuido" | "borderline" | "normal";
  explanation: string;
}

export interface ParameterExplanation {
  parameter: string;
  value: string;
  explanation: string;
  possibleCauses: string[];
}

export interface ReportResult {
  summary: string;
  findings: Finding[];
  medicalTerms: MedicalTerm[];
  overallInterpretation: string;
  disclaimer: string;
}

export interface ReportResultV2 {
  summary: string;
  overallInterpretation: string;
  findings: Finding[];
  medicalTerms: MedicalTerm[];
  outOfRangeValues: OutOfRangeValue[];
  parameterExplanations: ParameterExplanation[];
  possibleCauses: string[];
  recommendations: string[];
  suggestedQuestions: string[];
  disclaimer: string;
}

export interface ComparisonResult {
  summary: string;
  changes: ComparisonChange[];
  trends: ComparisonTrend[];
  overallAssessment: string;
  recommendations: string[];
  suggestedQuestions: string[];
}

export interface ComparisonChange {
  parameter: string;
  previousValue: string;
  currentValue: string;
  change: "aumentó" | "disminuyó" | "se mantuvo";
  significance: "mejora" | "empeoramiento" | "estable";
  explanation: string;
}

export interface ComparisonTrend {
  parameter: string;
  values: string[];
  trend: "mejorando" | "empeorando" | "estable";
  warning?: string | null;
}

export interface AlertResult {
  alerts: {
    type: string;
    severity: "info" | "warning" | "critical";
    parameter: string;
    title: string;
    description: string;
    trend: "increasing" | "decreasing" | "unstable";
  }[];
}

export type PageState = "idle" | "loading" | "result" | "error";

export type StudyType =
  | "resonancia"
  | "tomografia"
  | "sangre"
  | "electrocardiograma"
  | "laboratorio"
  | "epicrisis"
  | "otro";

export const STUDY_TYPE_LABELS: Record<StudyType, string> = {
  resonancia: "Resonancia magnética (RMN)",
  tomografia: "Tomografía computada (TC)",
  sangre: "Análisis de sangre",
  electrocardiograma: "Electrocardiograma",
  laboratorio: "Estudios de laboratorio",
  epicrisis: "Epicrisis e informes clínicos",
  otro: "Otro tipo de estudio",
};

export const STUDY_TYPE_ICONS: Record<StudyType, string> = {
  resonancia: "brain",
  tomografia: "bone",
  sangre: "droplet",
  electrocardiograma: "heart",
  laboratorio: "microscope",
  epicrisis: "file",
  otro: "file",
};

export interface StudyWithAnalysis {
  id: string;
  title: string;
  studyType: string | null;
  studyDate: string | null;
  fileUrl: string;
  fileSize: number;
  ocrApplied: boolean;
  profileId: string | null;
  profile: { id: string; name: string; color: string } | null;
  analysis: {
    id: string;
    summary: string;
    overallInterpretation: string;
    findings: Finding[];
    medicalTerms: MedicalTerm[];
    outOfRangeValues: OutOfRangeValue[];
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface FamilyProfileData {
  id: string;
  name: string;
  relation: string;
  color: string;
  studyCount?: number;
}
