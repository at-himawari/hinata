import { moodMeta } from "@/lib/utils";
import type { MoodValue } from "@/types/diary";

type MoodBadgeProps = {
  mood: MoodValue;
};

export function MoodBadge({ mood }: MoodBadgeProps) {
  const meta = moodMeta[mood];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
      style={{
        backgroundColor: meta.background,
        color: meta.color,
      }}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {meta.icon}
      </span>
      <span>
        {mood} · {meta.label}
      </span>
    </span>
  );
}
