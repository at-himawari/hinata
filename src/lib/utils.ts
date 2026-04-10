import type { MoodValue } from "@/types/diary";

export const moodMeta: Record<
  MoodValue,
  {
    label: string;
    icon: string;
    color: string;
    background: string;
  }
> = {
  1: {
    label: "くもり",
    icon: "😔",
    color: "#6b7280",
    background: "#edf2f7",
  },
  2: {
    label: "うすぐもり",
    icon: "😕",
    color: "#718096",
    background: "#eef3f7",
  },
  3: {
    label: "ふつう",
    icon: "😌",
    color: "#8a6d3b",
    background: "#fff1d6",
  },
  4: {
    label: "あたたかい",
    icon: "🙂",
    color: "#c67b22",
    background: "#ffe7bc",
  },
  5: {
    label: "はれ",
    icon: "😄",
    color: "#b45309",
    background: "#ffd889",
  },
};

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatEntryPreview(body: string) {
  const trimmed = body.trim();

  if (trimmed.length <= 60) {
    return trimmed;
  }

  return `${trimmed.slice(0, 60)}…`;
}
