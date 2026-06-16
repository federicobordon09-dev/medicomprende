import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-6 md:p-8 border border-sk-200/60 ${
        hover ? "card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ icon, title }: { icon?: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-sk-100 flex items-center justify-center text-sk-600">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-lg text-warm-950">{title}</h3>
    </div>
  );
}
