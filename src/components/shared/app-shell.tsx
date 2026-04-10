import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.24em] text-[var(--color-soft-text)] uppercase">
              Warm diary
            </p>
            <h1 className="mt-2 font-sans text-4xl font-bold text-[var(--color-ink)]">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-soft-text)] sm:text-base">
              {subtitle}
            </p>
          </div>
          <Link
            href="/settings"
            className="rounded-full border border-[var(--color-line)] bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--color-ink)] shadow-[0_10px_25px_rgba(127,95,58,0.08)] transition hover:bg-white"
          >
            設定
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-8 pb-4 text-center text-xs leading-6 text-[var(--color-soft-text)]">
          日記データは、ブラウザに保存されるため誰にも公開されません。
        </footer>
      </div>

      <BottomNav />
    </div>
  );
}
