"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { Panel } from "@/components/shared/panel";
import {
  disablePushSubscription,
  getNotificationPermission,
  getPushSupportStatus,
  requestNotificationPermission,
  syncPushSubscription,
} from "@/lib/notifications";
import { getSettings, saveSettings } from "@/lib/db/settings";
import type { AppSettings } from "@/types/diary";

const notificationHours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const notificationMinutes = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    notificationEnabled: false,
    notificationTime: "21:00",
  });
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [savedText, setSavedText] = useState("読み込み中です");
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmittingNotification, setIsSubmittingNotification] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const appSettings = await getSettings();
      const notificationPermission = getNotificationPermission();
      const support = getPushSupportStatus();

      if (cancelled) {
        return;
      }

      setSettings(appSettings);
      setPermission(notificationPermission);
      setIsPushSupported(support.supported);
      setSupportMessage(support.message);
      setIsIosDevice(/iPhone|iPad|iPod/i.test(window.navigator.userAgent));
      setIsStandaloneMode(
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
          // Safari on iOS exposes this property in standalone mode.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.navigator as any).standalone === true,
      );
      setSavedText("設定は自動で保存されます");

      if (notificationPermission === "granted" && appSettings.notificationEnabled) {
        void syncPushSubscription({
          notificationTime: appSettings.notificationTime,
          enabled: true,
        }).catch(() => {
          // The UI already exposes the current support state.
        });
      }
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

  async function handleNotificationEnabledChange(enabled: boolean) {
    const nextSettings = {
      ...settings,
      notificationEnabled: enabled,
    };

    setIsSubmittingNotification(true);

    if (enabled) {
      const support = getPushSupportStatus();

      if (!support.supported) {
        setSavedText(support.message);
        setIsSubmittingNotification(false);
        return;
      }

      let nextPermission = permission;

      if (nextPermission !== "granted") {
        nextPermission = await requestNotificationPermission();
        setPermission(nextPermission);

        if (nextPermission !== "granted") {
          setSavedText("通知の許可が必要です");
          setIsSubmittingNotification(false);
          return;
        }
      }

      try {
        await syncPushSubscription({
          notificationTime: settings.notificationTime,
          enabled: true,
        });
        await updateSettings(nextSettings);
        setSavedText("通知をオンにしました");
      } catch (error) {
        setSavedText(
          error instanceof Error ? error.message : "通知の設定に失敗しました",
        );
      } finally {
        setIsSubmittingNotification(false);
      }

      return;
    }

    try {
      await disablePushSubscription();
      await updateSettings(nextSettings);
      setSavedText("通知をオフにしました");
    } catch (error) {
      setSavedText(
        error instanceof Error ? error.message : "通知の解除に失敗しました",
      );
    } finally {
      setIsSubmittingNotification(false);
    }
  }

  async function updateNotificationPart(part: "hours" | "minutes", value: string) {
    const [currentHours, currentMinutes] = settings.notificationTime.split(":");
    const nextHours = part === "hours" ? value : currentHours;
    const nextMinutes = part === "minutes" ? value : currentMinutes;
    const nextSettings = {
      ...settings,
      notificationTime: `${nextHours}:${nextMinutes}`,
    };

    await updateSettings(nextSettings);

    if (settings.notificationEnabled && permission === "granted") {
      try {
        await syncPushSubscription({
          notificationTime: nextSettings.notificationTime,
          enabled: true,
        });
        setSavedText("通知時刻を更新しました");
      } catch (error) {
        setSavedText(
          error instanceof Error ? error.message : "通知時刻の同期に失敗しました",
        );
      }
    }
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
            Web Push を使うと、アプリを閉じていてもやさしく届きます。
          </p>

          {!isPushSupported ? (
            <div className="mt-5 rounded-[24px] border border-[var(--color-accent-deep)] bg-[linear-gradient(135deg,rgba(255,239,205,0.98),rgba(255,249,235,0.98))] p-4">
              <p className="text-sm font-bold text-[var(--color-ink)]">
                {isIosDevice && !isStandaloneMode
                  ? "iPhoneでは、ホーム画面から開かないと通知を使えません"
                  : "この端末では、通知の前に準備が必要です"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-soft-text)]">
                {supportMessage}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">通知を受け取る</p>
                <p className="text-sm text-[var(--color-soft-text)]">
                  ボタンを一度押すと、通知の許可と購読設定をまとめて行います
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void handleNotificationEnabledChange(!settings.notificationEnabled)
                  }
                  disabled={isSubmittingNotification}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5 disabled:opacity-80"
                >
                  {isSubmittingNotification ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-ink)] border-t-transparent" />
                      <span>設定中です...</span>
                    </>
                  ) : settings.notificationEnabled ? (
                    "通知をオフにする"
                  ) : (
                    "通知を受け取る"
                  )}
                </button>
                <span className="text-sm text-[var(--color-soft-text)]">
                  {settings.notificationEnabled ? "現在オンです" : "現在オフです"}
                </span>
              </div>
            </div>

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
                      void updateNotificationPart("hours", event.target.value)
                    }
                    disabled={isSubmittingNotification}
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
                      void updateNotificationPart("minutes", event.target.value)
                    }
                    disabled={isSubmittingNotification}
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
          </div>

          <p className="mt-4 text-sm text-[var(--color-soft-text)]">{savedText}</p>
        </Panel>
      </div>
    </AppShell>
  );
}
