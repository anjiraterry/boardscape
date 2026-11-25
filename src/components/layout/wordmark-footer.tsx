"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BoardscapeMark } from "@/components/brand/boardscape-logo";
import { cn } from "@/lib/utils";

// At least 44px tall wherever a finger taps it
const tap =
  "max-md:inline-flex max-md:min-h-11 max-md:items-center pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export interface WordmarkFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** The product name: the wordmark top left and the large name at the bottom. */
  name: string;
  /** The name in the © line. */
  legalName?: string;
  year: number;
  description?: string;
  email?: string;
  /** A short status line next to an accent dot. */
  status?: string;
  /** What screen readers call the footer navigation. */
  navLabel?: string;
  columns: FooterColumn[];
  /** A small link at the end of the bottom line. */
  credit?: { label: string; href: string };
}

/**
 * Clean charcoal footer with collapsible mobile columns and the oversized
 * lowercase wordmark filled with the geometric doodle pattern, fading smoothly
 * into the charcoal background.
 */
export function WordmarkFooter({
  name,
  legalName,
  year,
  description,
  email,
  status,
  navLabel = "Footer",
  columns,
  credit,
  className,
  ...props
}: WordmarkFooterProps) {
  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-charcoal text-white",
        className
      )}
      {...props}
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-12 px-6 pt-16 pb-10 max-md:gap-6 max-md:pt-12 max-md:pb-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <span className="inline-flex items-center gap-1.5 font-display text-[26px] font-black leading-none tracking-[-0.03em] text-white">
            <BoardscapeMark className="h-8 w-8 text-white" />
            <span>{name}</span>
          </span>
          {description && (
            <p className="mt-4 max-w-[300px] text-[14px] leading-[22px] text-neutral-300">
              {description}
            </p>
          )}
          {status && (
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-neutral-300">
              <span
                className="size-2 rounded-full bg-limebrand"
                aria-hidden="true"
              />
              {status}
            </p>
          )}
        </div>

        <nav
          aria-label={navLabel}
          className="grid grid-cols-2 gap-8 max-md:hidden md:col-span-6 md:col-start-7 lg:grid-cols-3"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 uppercase">
                {col.title}
              </p>
              <ul className="mt-4 grid gap-2.5 pointer-coarse:mt-2 pointer-coarse:gap-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={cn(
                        "text-[14px] text-neutral-300 transition-colors hover:text-limebrand",
                        tap
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Phones: each column folds away; tap a heading to open it */}
        <nav aria-label={navLabel} className="-mx-4 grid gap-1 md:hidden">
          {columns.map((col) => (
            <details
              key={col.title}
              className="group rounded-2xl open:bg-white/[0.04]"
            >
              <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[12px] tracking-[0.14em] text-neutral-300 uppercase">
                  {col.title}
                </span>
                <Plus
                  className="size-4 text-neutral-400 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </summary>
              <ul className="px-4 pb-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="block py-3 text-[15px] text-neutral-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-6 pb-2 text-[13px] text-neutral-400 sm:flex-row sm:items-center sm:gap-6 md:px-10">
        <p className="font-mono tabular-nums">
          © {year} {legalName ?? name}
        </p>
        {email && (
          <a href={`mailto:${email}`} className={cn("hover:text-white", tap)}>
            {email}
          </a>
        )}
        {credit && (
          <Link href={credit.href} className={cn("hover:text-white sm:ml-auto", tap)}>
            {credit.label}
          </Link>
        )}
      </div>

      {/* Clean oversized boardscape wordmark fading smoothly into charcoal */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.18em] text-center font-display text-[clamp(72px,18vw,280px)] font-black leading-[0.9] tracking-[-0.04em] text-transparent select-none bg-clip-text bg-gradient-to-b from-white/15 to-transparent max-md:text-[21vw]"
      >
        {name}
      </p>
    </footer>
  );
}

export default WordmarkFooter;
