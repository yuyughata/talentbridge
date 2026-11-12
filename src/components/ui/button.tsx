import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-lime-sheen text-ink-900 shadow-lime-glow hover:brightness-105 focus-visible:ring-lime-500 active:brightness-95",
  secondary: "bg-navy text-white hover:bg-navy-700 focus-visible:ring-navy",
  ghost: "bg-transparent text-navy hover:bg-navy-50 focus-visible:ring-navy",
  outline:
    "border border-navy-200 bg-transparent text-navy hover:border-navy-300 hover:bg-navy-50 focus-visible:ring-navy",
  danger: "bg-risk text-white hover:bg-risk-600 focus-visible:ring-risk",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-[15px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
