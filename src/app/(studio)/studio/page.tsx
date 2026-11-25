import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "boardscape Studio" };

export default async function StudioDashboardPage() {
  let counts = {
    publishedFaces: 0,
    pendingSurveys: 0,
    openLeads: 0,
    activeCampaigns: 0,
  };

  if (isDatabaseConfigured()) {
    const sql = getSql();
    const [facesRes, surveysRes, leadsRes, campaignsRes] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM faces WHERE state = 'published'`,
      sql`SELECT COUNT(*)::int AS count FROM surveys WHERE duplicate_review_status IN ('pending', 'flagged_nearby')`,
      sql`SELECT COUNT(*)::int AS count FROM leads WHERE status IN ('new', 'qualified', 'proposal_in_progress')`,
      sql`SELECT COUNT(*)::int AS count FROM campaigns WHERE status IN ('approved', 'preproduction', 'ready_to_launch', 'installation_in_progress', 'live')`,
    ]);
    counts = {
      publishedFaces: Number(facesRes[0]?.count ?? 0),
      pendingSurveys: Number(surveysRes[0]?.count ?? 0),
      openLeads: Number(leadsRes[0]?.count ?? 0),
      activeCampaigns: Number(campaignsRes[0]?.count ?? 0),
    };
  }

  const metrics = [
    {
      num: "01",
      label: "Eligible Published Faces",
      value: counts.publishedFaces,
      note: "Operator-authorized & verified",
      href: "/studio/inventory",
    },
    {
      num: "02",
      label: "Surveys Awaiting Review",
      value: counts.pendingSurveys,
      note: "Includes nearby duplicate flags",
      href: "/studio/surveys",
    },
    {
      num: "03",
      label: "Open CRM Pipeline",
      value: counts.openLeads,
      note: "New, qualified, or in proposal",
      href: "/studio/leads",
    },
    {
      num: "04",
      label: "Active Campaigns",
      value: counts.activeCampaigns,
      note: "Approved through live flight",
      href: "/studio/campaigns",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Studio
          </h1>
          <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground">
            Internal agency operations across Abuja inventory, CRM, quotations,
            and campaign delivery.
          </p>
        </div>

        <Link
          href="/atlas"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-charcoal px-4 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 sm:self-auto"
        >
          View Public Atlas
          <ArrowUpRight className="h-4 w-4 text-limebrand" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-charcoal/50">
                  {m.num}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-charcoal" />
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
              <p className="mt-2 font-display text-4xl font-black tracking-tight text-charcoal">
                {m.value}
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{m.note}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
