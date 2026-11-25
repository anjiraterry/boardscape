"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_METADATA, type AppRole } from "@/modules/identity/schemas";

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  role: AppRole | null;
  organizationId: string | null;
  organizationName: string | null;
}

export interface OrgOption {
  id: string;
  name: string;
  type: string;
}

export function AdminUsersClient({
  initialUsers,
  organizations,
  assignableRoles,
  canManageUsers,
}: {
  initialUsers: AdminUserRow[];
  organizations: OrgOption[];
  assignableRoles: AppRole[];
  canManageUsers: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>(assignableRoles[0] ?? "surveyor");
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filtered = initialUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.organizationName ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, organizationId }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to create user.");
        return;
      }
      setFullName("");
      setEmail("");
      setPassword("");
      setShowInvite(false);
      setSuccess("User account created and assigned to organization.");
      router.refresh();
    } catch {
      setError("Network error creating user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, org..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLE_METADATA).map(([k, meta]) => (
              <option key={k} value={k}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {canManageUsers && (
          <Button
            onClick={() => setShowInvite((v) => !v)}
            className="bg-limebrand text-charcoal hover:bg-limebrand-500 font-semibold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showInvite ? "Close Form" : "Invite / Create User"}
          </Button>
        )}
      </div>

      {success && (
        <p className="rounded-lg border border-limebrand-600/30 bg-limebrand/20 px-4 py-2.5 text-sm text-charcoal">
          {success}
        </p>
      )}

      {showInvite && canManageUsers && (
        <form
          onSubmit={handleInvite}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-charcoal">
            Create & Assign Platform User
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">Full Name</Label>
              <Input
                id="inv-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Work Email</Label>
              <Input
                id="inv-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@organization.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-password">Initial Password (min 10 chars)</Label>
              <Input
                id="inv-password"
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 10 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-role">Authorized Role</Label>
              <select
                id="inv-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_METADATA[r]?.label ?? r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-org">Organization</Label>
              <select
                id="inv-org"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {user.role ? (
                        <span className="rounded bg-secondary px-2 py-0.5 font-medium text-charcoal">
                          {ROLE_METADATA[user.role]?.label ?? user.role}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal">
                      {user.organizationName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`rounded-md px-2 py-0.5 font-medium ${
                          user.status === "active"
                            ? "bg-limebrand/25 text-charcoal"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-xs font-semibold text-charcoal hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
