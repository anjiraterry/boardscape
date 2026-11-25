import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const session = await getServerSession();
  requirePermission(session, "settings:manage");

  const checks = [
    {
      name: "Neon PostgreSQL (DATABASE_URL)",
      configured: isDatabaseConfigured(),
      detail: `Active branch: ${process.env.NEON_BRANCH ?? "local"}`,
    },
    {
      name: "Session Signing Secret (AUTH_SECRET)",
      configured: Boolean(
        process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16
      ),
      detail: "HMAC-SHA256 stateless session cookie signing",
    },
    {
      name: "Media Object Storage (BLOB_READ_WRITE_TOKEN)",
      configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      detail: process.env.BLOB_READ_WRITE_TOKEN
        ? "Vercel Blob storage active"
        : "Using local filesystem uploads fallback",
    },
    {
      name: "Custom Map Style (NEXT_PUBLIC_MAP_STYLE_URL)",
      configured: Boolean(process.env.NEXT_PUBLIC_MAP_STYLE_URL),
      detail: process.env.NEXT_PUBLIC_MAP_STYLE_URL
        ? "Custom vector tile style configured"
        : "Using default OpenFreeMap style",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Configuration
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Integrations & Diagnostics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Non-sensitive integration status. Credentials and connection strings
          are stored in protected environment configuration and never exposed.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0 text-charcoal" />
        <span>
          Secret values are masked by design. Only configuration presence and
          non-sensitive runtime diagnostics are displayed.
        </span>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {checks.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="text-sm font-semibold text-charcoal">{item.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.detail}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
              {item.configured ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-limebrand-600" />
                  <span className="text-charcoal">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Not Set / Fallback</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
