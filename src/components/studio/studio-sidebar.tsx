"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  FileCheck2,
  History,
  Layers,
  MapPin,
  Receipt,
  Users,
} from "lucide-react";
import { BoardscapeMark } from "@/components/brand/boardscape-logo";

const STUDIO_NAV = [
  { href: "/studio", label: "Overview", icon: BarChart3 },
  { href: "/studio/inventory", label: "Inventory", icon: MapPin },
  { href: "/studio/surveys", label: "Surveys", icon: ClipboardCheck },
  { href: "/studio/operators", label: "Operators", icon: Users },
  { href: "/studio/leads", label: "CRM & Leads", icon: Briefcase },
  { href: "/studio/quotes", label: "Quotes & Bookings", icon: Receipt },
  { href: "/studio/campaigns", label: "Campaigns", icon: Layers },
  { href: "/studio/compliance", label: "Compliance", icon: FileCheck2 },
  { href: "/studio/audit", label: "Audit Log", icon: History },
];

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 bg-charcoal text-white lg:w-64 lg:min-h-screen">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-display text-2xl font-black tracking-tight text-white"
          >
            <BoardscapeMark className="h-8 w-8 text-white" />
            <span>boardscape</span>
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-limebrand lg:mt-1">
            Studio Ops
          </p>
        </div>

        <nav
          aria-label="Studio Navigation"
          className="mt-5 flex gap-1.5 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
        >
          {STUDIO_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/studio"
                ? pathname === "/studio"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-limebrand font-bold text-charcoal"
                    : "text-neutral-300 hover:bg-charcoal-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-charcoal" : "text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
