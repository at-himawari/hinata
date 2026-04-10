"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { AppShell } from "@/components/shared/app-shell";
import { Panel } from "@/components/shared/panel";
import { MoodPicker } from "@/components/write/mood-picker";
import { deleteDraftByDate, getDraftByDate, saveDraft } from "@/lib/db/drafts";
import { getEntryByDate, saveDiaryEntry } from "@/lib/db/entries";
import { getShareText, openShareWindow } from "@/lib/share";
import { getTodayKey } from "@/lib/utils";
import type { DraftEntry } from "@/types/diary";

const AUTOSAVE_DELAY = 500;

export function WritePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? getTodayKey();
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [statusText, setStatusText] = useState("読み込み中です");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setHydrated(false);
      setDirty(false);

      const [savedEntry, draft] = await Promise.all([
        getEntryByDate(date),
        getDraftByDate(date),
      ]);

      if (cancelled) {
        return;
      }

      if (savedEntry) {
        setEntryId(savedEntry.id);
        setBody(savedEntry.body);
        setMood(savedEntry.mood);
        setStatusText("保存済みの日記を開いています");
      } else if (draft) {
        setEntryId(null);
        setBody(draft.body);
        setMood(draft.mood);
        setStatusText("前回の下書きを復元しました");
      } else {
        setEntryId(null);
        setBody("");
        setMood(undefined);
        setStatusText("入力すると自動で下書き保存されます");
      }

      setHydrated(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    if (!hydrated || !dirty) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const draft: DraftEntry = {
        date,
        body,
        mood,
        updatedAt: new Date().toISOString(),
      };

      await saveDraft(draft);
      setDirty(false);
      setStatusText(
        `最終保存: ${format(new Date(), "HH:mm", { locale: ja })}`,
      );
    }, AUTOSAVE_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [body, date, dirty, hydrated, mood]);

  async function handleSave() {
    if (!mood || !body.trim()) {
      setStatusText("気分と本文を入れると保存できます");
      return;
    }

    const savedEntry = await saveDiaryEntry({
      id: entryId ?? crypto.randomUUID(),
      date,
      mood,
      body: body.trim(),
    });
    await deleteDraftByDate(date);

    setEntryId(savedEntry.id);
    setDirty(false);
    setStatusText("日記を保存しました");
    router.push("/");
  }

  function updateBody(nextBody: string) {
    setBody(nextBody);
    setDirty(true);
    setStatusText("下書きを保存しています...");
  }

  function updateMood(nextMood: 1 | 2 | 3 | 4 | 5) {
    setMood(nextMood);
    setDirty(true);
    setStatusText("下書きを保存しています...");
  }

  return (
    <AppShell
      title="今日の記録"
      subtitle="書きかけでも大丈夫。文字が変わるたびに下書き保存されます。"
    >
      <div className="grid gap-5">
        <Panel>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-soft-text)]">
                {format(parseISO(date), "yyyy年M月d日 EEEE", { locale: ja })}
              </p>
              <h2 className="text-3xl font-bold text-[var(--color-ink)]">
                今日はどんな一日でしたか？
              </h2>
            </div>
            <Link
              href="/"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-white"
            >
              ホームへ戻る
            </Link>
          </div>

          <MoodPicker value={mood} onChange={updateMood} />

          <div className="mt-6">
            <label
              htmlFor="diary-body"
              className="mb-3 block text-sm font-semibold text-[var(--color-ink)]"
            >
              本文
            </label>
            <textarea
              id="diary-body"
              value={body}
              onChange={(event) => updateBody(event.target.value)}
              placeholder="うれしかったこと、ひと息ついたこと、まだ言葉にならないことも、そのままで。"
              className="min-h-[320px] w-full rounded-[28px] border border-[var(--color-line)] bg-white px-5 py-4 text-base leading-8 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent-deep)]"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-soft-text)]">{statusText}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5"
              >
                保存する
              </button>
              <button
                type="button"
                onClick={() => openShareWindow()}
                className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-panel-alt)]"
              >
                共有する
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="bg-[linear-gradient(180deg,rgba(255,251,244,0.98),rgba(255,245,228,0.98))]">
          <h3 className="text-2xl font-bold text-[var(--color-ink)]">
            共有テキスト
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--color-soft-text)]">
            本文は誰にも公開されません。定型文だけをXに送れます。
          </p>
          <div className="mt-4 rounded-[24px] bg-white/85 p-4 text-sm text-[var(--color-ink)]">
            {getShareText()}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
