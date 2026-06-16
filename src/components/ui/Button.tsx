"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-coral-500 hover:bg-coral-600 text-white shadow-lg hover:shadow-xl",
  secondary: "bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50",
  ghost: "text-white/80 hover:text-white hover:bg-white/10",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 text-xs min-h-[32px]",
  md: "px-6 py-3 text-sm min-h-[44px]",
  lg: "px-8 py-3.5 text-base min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl active:scale-[0.97] transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="40" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
