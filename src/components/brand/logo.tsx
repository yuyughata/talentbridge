import { cn } from "@/lib/utils";

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold", className)}>
      <span
        aria-hidden
        className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-lime-sheen text-sm font-bold text-ink-900 shadow-lime-glow"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="9" opacity="0.5" />
          <path d="M12 8l3 2.2-1.1 3.5h-3.8L9 10.2 12 8z" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn("block text-[15px] font-semibold", dark ? "text-white" : "text-navy")}>
          Talent Bridge
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[0.6rem] font-semibold uppercase tracking-[0.22em]",
            dark ? "text-lime-400" : "text-amber-600",
          )}
        >
          Africa
        </span>
      </span>
    </span>
  );
}
