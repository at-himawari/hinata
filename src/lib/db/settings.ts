import { getDB } from "@/lib/db/index";
import type { AppSettings } from "@/types/diary";

const SETTINGS_KEY = "app";
export const SETTINGS_UPDATED_EVENT = "hinata:settings-updated";

const defaultSettings: AppSettings = {
  notificationEnabled: false,
  notificationTime: "21:00",
};

function normalizeNotificationTime(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match) {
    return defaultSettings.notificationTime;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return defaultSettings.notificationTime;
  }

  const totalMinutes = hours * 60 + minutes;
  const normalizedMinutes = Math.round(totalMinutes / 5) * 5;
  const wrappedMinutes = normalizedMinutes % (24 * 60);
  const normalizedHours = Math.floor(wrappedMinutes / 60);
  const nextMinutes = wrappedMinutes % 60;

  return `${String(normalizedHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

export async function getSettings() {
  const db = await getDB();
  const settings = (await db.get("settings", SETTINGS_KEY)) ?? defaultSettings;

  return {
    ...settings,
    notificationTime: normalizeNotificationTime(settings.notificationTime),
  };
}

export async function saveSettings(settings: AppSettings) {
  const db = await getDB();
  const normalizedSettings = {
    ...settings,
    notificationTime: normalizeNotificationTime(settings.notificationTime),
  };

  await db.put("settings", normalizedSettings, SETTINGS_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  }

  return normalizedSettings;
}
