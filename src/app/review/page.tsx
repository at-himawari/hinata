"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { MoodChart } from "@/components/review/mood-chart";
import { AppShell } from "@/components/shared/app-shell";
import { MoodBadge } from "@/components/shared/mood-badge";
import { Panel } from "@/components/shared/panel";
import { listDiaryEntries } from "@/lib/db/entries";
import { formatEntryPreview } from "@/lib/utils";
import type { DiaryEntry } from "@/types/diary";

export default function ReviewPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entryList = await listDiaryEntries();

      if (!cancelled) {
        setEntries(entryList);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      title="ふり返り"
      subtitle="積み重なった記録を、グラフと一覧で静かに見返せます。"
    >
      <div className="grid gap-5">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-ink)]">
                気分のうつろい
              </h2>
              <p className="text-sm text-[var(--color-soft-text)]">
                1がくもり、5がはれです
              </p>
            </div>
            <Link
              href="/write"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-white"
            >
              今日の記録を書く
            </Link>
          </div>
          <div className="h-72">
            {entries.length > 0 ? (
              <MoodChart entries={[...entries].reverse()} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[24px] bg-[var(--color-panel-alt)] text-sm text-[var(--color-soft-text)]">
                まだグラフにする記録がありません
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-[var(--color-ink)]">
              記録一覧
            </h2>
            <p className="text-sm text-[var(--color-soft-text)]">
              タップすると、その日の内容を開いて編集できます
            </p>
          </div>

          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Link
                  key={entry.date}
                  href={`/write?date=${entry.date}`}
                  className="block rounded-[24px] border border-[var(--color-line)] bg-white/80 p-4 transition hover:border-[var(--color-accent-deep)] hover:bg-white"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {format(parseISO(entry.date), "yyyy年M月d日 EEEE", {
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
              日記を書き始めると、ここに記録が並びます。
            </p>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
