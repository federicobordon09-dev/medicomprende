import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`brutal-card ${hover ? "" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ icon, title }: { icon?: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 brutal-border-b">
      {icon && (
        <div className="w-10 h-10 flex items-center justify-center bg-accent text-ink border-2 border-ink">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight">{title}</h3>
    </div>
  );
}
