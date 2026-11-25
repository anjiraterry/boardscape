import { KeyRound, ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { requireAdminAccess } from "@/lib/auth/guards";
import {
  ALL_PERMISSIONS,
  ROLE_METADATA,
  type AppRole,
} from "@/modules/identity/schemas";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const session = await getServerSession();
  requireAdminAccess(session);

  const roles = Object.entries(ROLE_METADATA) as [
    AppRole,
    (typeof ROLE_METADATA)[AppRole],
  ][];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Users & Access
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal">
          Roles & Granular Permissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server-enforced permission matrix. Administrators cannot grant roles
          that include permissions they do not possess.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map(([roleKey, meta]) => (
          <div
            key={roleKey}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-charcoal">
                  {meta.label}
                </h2>
                <p className="font-mono text-xs text-muted-foreground">
                  {roleKey}
                </p>
              </div>
              {roleKey === "super_admin" ? (
                <ShieldCheck className="h-5 w-5 text-limebrand-600 shrink-0" />
              ) : (
                <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Scope: {meta.scope}
            </p>
            <div className="pt-2 border-t border-border">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Permissions ({meta.permissions.length})
              </p>
              {meta.permissions.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Scoped operational access only (no platform admin permissions)
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {meta.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-charcoal"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-4">
          Permission Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Permission</th>
                {roles.map(([roleKey, meta]) => (
                  <th key={roleKey} className="py-2 px-2 font-medium text-center">
                    {meta.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm}>
                  <td className="py-2 pr-4 font-mono text-charcoal">{perm}</td>
                  {roles.map(([roleKey, meta]) => {
                    const granted = meta.permissions.includes(perm);
                    return (
                      <td key={roleKey} className="py-2 px-2 text-center">
                        {granted ? (
                          <span className="inline-block rounded bg-limebrand/30 px-1.5 py-0.5 font-semibold text-charcoal">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
