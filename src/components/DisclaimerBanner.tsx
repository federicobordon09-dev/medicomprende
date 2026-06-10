import { disclaimer } from "@/data/contenido";

export default function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div>
        <p className="text-sm text-warm-700 leading-relaxed">
          <strong className="text-amber-800 font-bold">Importante:</strong> {disclaimer.text}
        </p>
      </div>
    </div>
  );
}
