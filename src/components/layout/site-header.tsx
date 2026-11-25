"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BoardscapeMark } from "@/components/brand/boardscape-logo";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/outdoor-advertising", label: "Outdoor" },
  { href: "/atlas-overview", label: "Atlas" },
  { href: "/atlas", label: "Explore Map", accent: true },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-1.5 font-display text-2xl font-black tracking-tight text-white"
          >
            <BoardscapeMark className="h-8 w-8 text-white" />
            <span>boardscape</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.accent
                    ? "text-neutral-300 transition-colors hover:text-limebrand"
                    : "text-neutral-300 transition-colors hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/studio"
            className="hidden font-mono text-xs uppercase tracking-wider text-neutral-300 hover:text-white sm:inline-flex"
          >
            Studio
          </Link>
          <Link
            href="/brief"
            className="inline-flex h-9 items-center justify-center rounded-md bg-limebrand px-3.5 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500 sm:px-4"
          >
            Submit Brief
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="border-t border-white/10 bg-charcoal px-4 pb-5 pt-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center rounded-lg px-3 text-base font-medium transition-colors ${
                  item.accent
                    ? "text-limebrand hover:bg-white/5"
                    : "text-neutral-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 font-mono text-xs uppercase tracking-wider text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Studio
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
