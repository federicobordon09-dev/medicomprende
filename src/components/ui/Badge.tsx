interface BadgeProps {
  children: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "brutal-tag brutal-tag--white",
  success: "brutal-tag brutal-tag--white",
  warning: "brutal-tag",
  danger: "brutal-tag brutal-tag--red",
  info: "brutal-tag",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
