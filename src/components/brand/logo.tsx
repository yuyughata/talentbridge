import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-md bg-teal text-sm font-bold text-white"
      >
        TB
      </span>
      <span className="leading-tight">
        <span className="block text-navy">Talent Bridge</span>
        <span className="-mt-1 block text-[0.65rem] font-medium uppercase tracking-widest text-teal">
          Africa
        </span>
      </span>
    </span>
  );
}
