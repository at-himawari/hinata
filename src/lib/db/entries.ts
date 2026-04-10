import { getDB } from "@/lib/db/index";
import type { DiaryEntry, MoodValue } from "@/types/diary";

type SaveDiaryEntryInput = {
  id: string;
  date: string;
  mood: MoodValue;
  body: string;
};

export async function listDiaryEntries() {
  const db = await getDB();
  const entries = await db.getAll("entries");

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEntryByDate(date: string) {
  const db = await getDB();
  return db.get("entries", date);
}

export async function saveDiaryEntry(input: SaveDiaryEntryInput) {
  const db = await getDB();
  const existing = await db.get("entries", input.date);

  const entry: DiaryEntry = {
    id: existing?.id ?? input.id,
    date: input.date,
    mood: input.mood,
    body: input.body,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.put("entries", entry);

  return entry;
}
