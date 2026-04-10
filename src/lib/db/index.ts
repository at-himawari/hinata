import { openDB } from "idb";
import type { AppSettings, DiaryEntry, DraftEntry } from "@/types/diary";

type HinataDB = {
  entries: {
    key: string;
    value: DiaryEntry;
  };
  drafts: {
    key: string;
    value: DraftEntry;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
};

let dbPromise: ReturnType<typeof openDB<HinataDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HinataDB>("hinata-db", 1, {
      upgrade(db) {
        db.createObjectStore("entries", {
          keyPath: "date",
        });
        db.createObjectStore("drafts", {
          keyPath: "date",
        });
        db.createObjectStore("settings");
      },
    });
  }

  return dbPromise;
}
