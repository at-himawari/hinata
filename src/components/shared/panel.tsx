import type { HTMLAttributes } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement>;

export function Panel({ className = "", ...props }: PanelProps) {
  return (
    <div
      className={`rounded-[32px] border border-white/70 bg-[var(--color-panel)] p-5 shadow-[0_20px_45px_rgba(140,100,54,0.08)] backdrop-blur sm:p-6 ${className}`}
      {...props}
    />
  );
}
