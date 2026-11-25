"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardCheck,
  History,
  KeyRound,
  Layers,
  LayoutDashboard,
  MapPin,
  Plug,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BoardscapeMark } from "@/components/brand/boardscape-logo";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles & RBAC", icon: KeyRound },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/inventory", label: "Inventory Oversight", icon: MapPin },
  { href: "/admin/verifications", label: "Verification Center", icon: ClipboardCheck },
  { href: "/admin/campaigns", label: "Campaign Oversight", icon: Layers },
  { href: "/admin/audit", label: "Audit Logs", icon: History },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
];

export function AdminSidebar({
  actorName,
  actorRoleLabel,
}: {
  actorName: string;
  actorRoleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 bg-charcoal text-white lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between lg:block">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 font-display text-2xl font-black tracking-tight text-white"
          >
            <BoardscapeMark className="h-8 w-8 text-white" />
            <span>boardscape</span>
          </Link>
          <div className="flex items-center gap-1.5 lg:mt-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-limebrand" />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-limebrand">
              Platform Admin
            </p>
          </div>
        </div>

        <nav
          aria-label="Admin Navigation"
          className="mt-5 flex gap-1.5 overflow-x-auto pb-1 lg:mt-7 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
        >
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-limebrand text-charcoal font-semibold"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 hidden border-t border-white/10 pt-4 lg:block">
          <p className="truncate text-xs font-medium text-white">{actorName}</p>
          <p className="mt-0.5 text-[11px] text-white/60">{actorRoleLabel}</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1 text-white/70 hover:text-limebrand"
            >
              <Activity className="h-3.5 w-3.5" />
              Studio Ops
            </Link>
            <Link
              href="/atlas"
              className="text-white/70 hover:text-limebrand"
            >
              Atlas
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
