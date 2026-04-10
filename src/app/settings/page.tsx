"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Panel } from "@/components/shared/panel";
import { getNotificationPermission, requestNotificationPermission } from "@/lib/notifications";
import { getSettings, saveSettings } from "@/lib/db/settings";
import type { AppSettings } from "@/types/diary";

const notificationHours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const notificationMinutes = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

function formatPermission(permission: NotificationPermission | "unsupported") {
  switch (permission) {
    case "granted":
      return "許可済み";
    case "denied":
      return "拒否されています";
    case "default":
      return "まだ選択していません";
    case "unsupported":
      return "このブラウザでは通知に対応していません";
    default:
      return permission;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    notificationEnabled: false,
    notificationTime: "21:00",
  });
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [savedText, setSavedText] = useState("読み込み中です");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const appSettings = await getSettings();
      const notificationPermission = getNotificationPermission();

      if (cancelled) {
        return;
      }

      setSettings(appSettings);
      setPermission(notificationPermission);
      setSavedText("設定は自動で保存されます");
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateSettings(next: AppSettings) {
    setSettings(next);
    await saveSettings(next);
    setSavedText("設定を保存しました");
  }

  async function handlePermissionRequest() {
    if (settings.notificationEnabled) {
      await updateSettings({
        ...settings,
        notificationEnabled: false,
      });
      setSavedText("通知をオフにしました");
      return;
    }

    if (permission === "granted") {
      await updateSettings({
        ...settings,
        notificationEnabled: true,
      });
      setSavedText("通知をオンにしました");
      return;
    }

    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      await updateSettings({
        ...settings,
        notificationEnabled: true,
      });
      setSavedText("通知をオンにしました");
      return;
    }

    setSavedText("通知の許可が必要です");
  }

  function updateNotificationPart(part: "hours" | "minutes", value: string) {
    const [currentHours, currentMinutes] = settings.notificationTime.split(":");
    const nextHours = part === "hours" ? value : currentHours;
    const nextMinutes = part === "minutes" ? value : currentMinutes;

    void updateSettings({
      ...settings,
      notificationTime: `${nextHours}:${nextMinutes}`,
    });
  }

  return (
    <AppShell
      title="設定"
      subtitle="通知の時間や、書くリズムに合わせた準備をここで整えます。"
    >
      <div className="grid gap-5">
        <Panel>
          <h2 className="text-3xl font-bold text-[var(--color-ink)]">通知</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-soft-text)]">
            ブラウザ通知は、アプリやPWAを開いているときにやさしく届きます。
          </p>

          <div className="mt-6 grid gap-5">
            <label className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">通知を受け取る</p>
                <p className="text-sm text-[var(--color-soft-text)]">
                  毎日の記録時間をそっと知らせます
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationEnabled}
                onChange={(event) =>
                  void updateSettings({
                    ...settings,
                    notificationEnabled: event.target.checked,
                  })
                }
                className="h-5 w-5 accent-[var(--color-accent-deep)]"
              />
            </label>

            <label className="rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4">
              <p className="font-semibold text-[var(--color-ink)]">通知時刻</p>
              <p className="mb-3 text-sm text-[var(--color-soft-text)]">
                生活リズムに合わせて選べます
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={settings.notificationTime.split(":")[0]}
                    onChange={(event) =>
                      updateNotificationPart("hours", event.target.value)
                    }
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel-alt)] px-4 py-2 text-[var(--color-ink)] outline-none"
                  >
                    {notificationHours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-semibold text-[var(--color-soft-text)]">
                    時
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={settings.notificationTime.split(":")[1]}
                    onChange={(event) =>
                      updateNotificationPart("minutes", event.target.value)
                    }
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel-alt)] px-4 py-2 text-[var(--color-ink)] outline-none"
                  >
                    {notificationMinutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-semibold text-[var(--color-soft-text)]">
                    分
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--color-soft-text)]">
                5分刻みで選べます
              </p>
            </label>

            <div className="rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4">
              <p className="font-semibold text-[var(--color-ink)]">通知の許可</p>
              <p className="mt-1 text-sm text-[var(--color-soft-text)]">
                現在の状態: {formatPermission(permission)}
              </p>
              <button
                type="button"
                onClick={() => void handlePermissionRequest()}
                className="mt-3 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5"
              >
                {settings.notificationEnabled ? "通知をオフにする" : "通知を許可する"}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--color-soft-text)]">{savedText}</p>
        </Panel>
      </div>
    </AppShell>
  );
}
