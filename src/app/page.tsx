"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { MoodChart } from "@/components/review/mood-chart";
import { AppShell } from "@/components/shared/app-shell";
import { MoodBadge } from "@/components/shared/mood-badge";
import { Panel } from "@/components/shared/panel";
import { listDiaryEntries } from "@/lib/db/entries";
import { getDraftByDate } from "@/lib/db/drafts";
import { getSettings, SETTINGS_UPDATED_EVENT } from "@/lib/db/settings";
import { getNotificationPermission, getPushSupportStatus } from "@/lib/notifications";
import { formatEntryPreview, getTodayKey } from "@/lib/utils";
import type { AppSettings, DiaryEntry } from "@/types/diary";

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [todayDraft, setTodayDraft] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [pushSupportMessage, setPushSupportMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [entryList, draft, appSettings] = await Promise.all([
        listDiaryEntries(),
        getDraftByDate(getTodayKey()),
        getSettings(),
      ]);

      if (cancelled) {
        return;
      }

      setEntries(entryList);
      setTodayDraft(Boolean(draft?.body.trim() || draft?.mood));
      setSettings(appSettings);
      setNotificationPermission(getNotificationPermission());
      setPushSupportMessage(getPushSupportStatus().message);
      setIsLoaded(true);
    }

    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, []);

  const todayEntry = entries.find((entry) => isToday(parseISO(entry.date)));
  const recentEntries = entries.slice(0, 4);
  const chartEntries = entries.slice(0, 7).reverse();

  return (
    <AppShell title="hinata" subtitle="今日のひかりを、ひとこと残す場所">
      <div className="grid gap-5">
        <Panel className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,242,214,0.95),rgba(255,251,244,0.98))]">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-[var(--color-soft-text)]">
                {format(new Date(), "M月d日 EEEE", { locale: ja })}
              </p>
              <h2 className="text-3xl font-bold text-[var(--color-ink)]">
                今日はどんな一日でしたか？
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {todayEntry ? (
                <>
                  <MoodBadge mood={todayEntry.mood} />
                  <p className="text-sm text-[var(--color-soft-text)]">
                    今日の記録は保存済みです
                  </p>
                </>
              ) : todayDraft ? (
                <p className="rounded-full bg-white/75 px-3 py-1 text-sm text-[var(--color-soft-text)]">
                  今日の下書きがあります
                </p>
              ) : (
                <p className="rounded-full bg-white/75 px-3 py-1 text-sm text-[var(--color-soft-text)]">
                  まだ今日の記録はありません
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/write"
                className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5"
              >
                今日の記録を書く
              </Link>
              <Link
                href="/review"
                className="rounded-full border border-[var(--color-line)] bg-white/90 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-white"
              >
                ふり返りを見る
              </Link>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-ink)]">
                  最近の日記
                </h3>
                <p className="text-sm text-[var(--color-soft-text)]">
                  直近の記録をやさしく見返せます
                </p>
              </div>
            </div>

            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <Link
                    key={entry.date}
                    href={`/write?date=${entry.date}`}
                    className="block rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4 transition hover:border-[var(--color-accent-deep)] hover:bg-white"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {format(parseISO(entry.date), "M月d日 EEEE", {
                          locale: ja,
                        })}
                      </p>
                      <MoodBadge mood={entry.mood} />
                    </div>
                    <p className="text-sm leading-7 text-[var(--color-soft-text)]">
                      {formatEntryPreview(entry.body)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--color-soft-text)]">
                まだ日記はありません。最初のひとことを書いてみましょう。
              </p>
            )}
          </Panel>

          <div className="grid gap-5">
            <Panel>
              <h3 className="text-2xl font-bold text-[var(--color-ink)]">
                今週の気分
              </h3>
              <p className="mt-1 text-sm text-[var(--color-soft-text)]">
                5段階の流れをふわっと見返せます
              </p>
              <div className="mt-4 h-52">
                {chartEntries.length > 0 ? (
                  <MoodChart entries={chartEntries} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[24px] bg-[var(--color-panel-alt)] text-sm text-[var(--color-soft-text)]">
                    記録がたまると、ここに気分のグラフが出ます
                  </div>
                )}
              </div>
            </Panel>

            <Panel>
              <h3 className="text-2xl font-bold text-[var(--color-ink)]">
                通知
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-soft-text)]">
                {isLoaded && settings ? (
                  settings.notificationEnabled &&
                  notificationPermission === "granted" ? (
                    <>
                      毎日 {settings.notificationTime} に、そっと書く時間をお知らせします。
                    </>
                  ) : notificationPermission === "unsupported" ? (
                    <>{pushSupportMessage}</>
                  ) : (
                    <>通知は今はオフです。必要になったら設定から選べます。</>
                  )
                ) : (
                  <>通知設定を読み込んでいます。</>
                )}
              </p>
              <Link
                href="/settings"
                className="mt-4 inline-flex rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-white"
              >
                通知時刻を設定する
              </Link>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
