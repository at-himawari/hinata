"use client";

import { useSyncExternalStore } from "react";

const DISMISS_KEY = "hinata:install-hint-dismissed";

type InstallHintKind = "hidden" | "ios" | "android";

function isIos(userAgent: string) {
  return /iPhone|iPad|iPod/i.test(userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    // Safari on iOS exposes this property in standalone mode.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function getSnapshot(): InstallHintKind {
  if (typeof window === "undefined") {
    return "hidden";
  }

  if (window.localStorage.getItem(DISMISS_KEY) === "1" || isStandalone()) {
    return "hidden";
  }

  const userAgent = window.navigator.userAgent;

  if (isIos(userAgent)) {
    return "ios";
  }

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  return "hidden";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
  const handleChange = () => callback();

  mediaQuery?.addEventListener?.("change", handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    mediaQuery?.removeEventListener?.("change", handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function getMessage(kind: InstallHintKind) {
  if (kind === "ios") {
    return "iPhoneでは、Safariの共有メニューから「ホーム画面に追加」すると通知を使えるようになります。";
  }

  if (kind === "android") {
    return "ブラウザメニューから「ホーム画面に追加」しておくと、通知や起動が使いやすくなります。";
  }

  return "";
}

export function InstallHint() {
  const kind = useSyncExternalStore<InstallHintKind>(
    subscribe,
    getSnapshot,
    () => "hidden",
  );

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event("storage"));
  }

  if (kind === "hidden") {
    return null;
  }

  return (
    <div className="mb-5 rounded-[28px] border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(255,248,236,0.95),rgba(255,241,214,0.98))] p-4 shadow-[0_14px_30px_rgba(149,108,58,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            ホーム画面に追加すると、もっと使いやすくなります
          </p>
          <p className="mt-1 text-sm leading-7 text-[var(--color-soft-text)]">
            {getMessage(kind)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[var(--color-line)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-soft-text)]"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
