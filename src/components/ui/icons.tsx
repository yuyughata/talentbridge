import type { SVGProps } from "react";

/**
 * Minimal inline icon set (no icon dependency). 24x24, 1.75 stroke, currentColor.
 * Soccer-flavoured where it helps the product read as a football tool.
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function BallIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l3.3 2.4-1.26 3.88H9.96L8.7 9.9 12 7.5z" />
      <path d="M12 3v4.5M4.8 9.6l3.9.3M19.2 9.6l-3.9.3M7.2 19l1.9-3.6M16.8 19l-1.9-3.6" />
    </svg>
  );
}

export function WhistleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10a4 4 0 0 1 4-4h9l5 2-2.5 3A6 6 0 1 1 9 12H3z" />
      <circle cx="9" cy="13" r="2.2" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 2.5v5c0 4.7-3.1 8.1-7 9.5-3.9-1.4-7-4.8-7-9.5v-5L12 3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16l3.5-4 3 2.5L20 8" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3M9 10l3 2-3 2v-4z" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17.5 20a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4zM9 11h6M9 15h4" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4M9 14h2v2H9z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15l4-3" />
      <path d="M4 15h2M18 15h2M12 7V5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2M12 14v2" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 4 13h6l-1 9 9-11h-6l1-9z" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function TrendUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function CheckBadgeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 2 2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.7.9 2.6-2 1.8.2 2.7-2.6.8-1.4 2.3-2.6-.7-2.4 1.3-1.7-2.1-2.7 0-1.7 2.1-2.4-1.3-2.6.7L5.6 18l-2.6-.8.2-2.7-2-1.8.9-2.6-.6-2.7L3.8 7l1-2.5 2.7.2L9.8 3 12 2z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
