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
  primary: "brutal-btn",
  secondary: "brutal-btn brutal-btn--white",
  ghost: "brutal-btn brutal-btn--ink",
  danger: "brutal-btn brutal-btn--red",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 text-xs min-h-[36px]",
  md: "px-5 py-3 text-sm min-h-[46px]",
  lg: "px-7 py-3.5 text-base min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
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
