import { getDB } from "@/lib/db/index";
import type { DraftEntry } from "@/types/diary";

export async function getDraftByDate(date: string) {
  const db = await getDB();
  return db.get("drafts", date);
}

export async function saveDraft(draft: DraftEntry) {
  const db = await getDB();
  await db.put("drafts", draft);
  return draft;
}

export async function deleteDraftByDate(date: string) {
  const db = await getDB();
  await db.delete("drafts", date);
}
