import { moodMeta } from "@/lib/utils";
import type { MoodValue } from "@/types/diary";

type MoodPickerProps = {
  value: MoodValue | undefined;
  onChange: (value: MoodValue) => void;
};

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">気分</p>
      <div className="grid gap-3 sm:grid-cols-5">
        {([1, 2, 3, 4, 5] as MoodValue[]).map((mood) => {
          const meta = moodMeta[mood];
          const isActive = value === mood;

          return (
            <button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              className={`rounded-[24px] border px-4 py-4 text-left transition ${
                isActive
                  ? "border-[var(--color-accent-deep)] shadow-[0_12px_30px_rgba(214,146,66,0.18)]"
                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-accent-deep)]"
              }`}
              style={{
                backgroundColor: isActive ? meta.background : "#ffffff",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/65 text-3xl leading-none shadow-[0_8px_18px_rgba(120,95,62,0.08)]"
                  aria-hidden="true"
                >
                  {meta.icon}
                </span>
                <p className="text-base font-semibold text-[var(--color-ink)]">{mood}</p>
              </div>
              <p className="mt-2 text-sm" style={{ color: meta.color }}>
                {meta.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
