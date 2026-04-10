"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/write", label: "書く" },
  { href: "/review", label: "ふり返り" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto flex w-[calc(100%-1.5rem)] max-w-md justify-between rounded-full border border-white/60 bg-white/85 p-2 shadow-[0_16px_40px_rgba(115,88,56,0.14)] backdrop-blur">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
              isActive
                ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                : "text-[var(--color-soft-text)] hover:bg-[var(--color-panel-alt)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
