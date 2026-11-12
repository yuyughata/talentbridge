import { cn } from "@/lib/utils";

/**
 * Decorative football-pitch line art. Pure ornament (a soccer motif), never a
 * status signal — rendered in low-opacity strokes on dark surfaces.
 */
export function PitchLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 260"
      className={cn("h-full w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
    >
      <rect x="6" y="6" width="388" height="248" rx="6" />
      <line x1="200" y1="6" x2="200" y2="254" />
      <circle cx="200" cy="130" r="42" />
      <circle cx="200" cy="130" r="2.4" fill="currentColor" stroke="none" />
      {/* left box */}
      <rect x="6" y="70" width="64" height="120" />
      <rect x="6" y="104" width="26" height="52" />
      <path d="M70 100a40 40 0 0 1 0 60" />
      <circle cx="46" cy="130" r="2" fill="currentColor" stroke="none" />
      {/* right box */}
      <rect x="330" y="70" width="64" height="120" />
      <rect x="368" y="104" width="26" height="52" />
      <path d="M330 100a40 40 0 0 0 0 60" />
      <circle cx="354" cy="130" r="2" fill="currentColor" stroke="none" />
      {/* corners */}
      <path d="M6 20a14 14 0 0 0 14-14M394 20a14 14 0 0 1-14-14M6 240a14 14 0 0 1 14 14M394 240a14 14 0 0 0-14 14" />
    </svg>
  );
}
