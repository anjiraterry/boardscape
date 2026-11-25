"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AdminOrgRow {
  id: string;
  name: string;
  type: "agency" | "operator" | "advertiser";
  slug: string;
  status: string;
  contactEmail: string | null;
  memberCount: number;
  createdAt: string;
}

export function AdminOrgsClient({
  initialOrgs,
}: {
  initialOrgs: AdminOrgRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<"agency" | "operator" | "advertiser">("operator");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filtered = initialOrgs.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.slug.toLowerCase().includes(q) ||
      (o.contactEmail ?? "").toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || o.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, contactEmail, contactPhone }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to create organization.");
        return;
      }
      setName("");
      setContactEmail("");
      setContactPhone("");
      setShowCreate(false);
      setSuccess("Organization created.");
      router.refresh();
    } catch {
      setError("Network error creating organization.");
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
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            aria-label="Filter by organization type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Types</option>
            <option value="agency">Agency</option>
            <option value="operator">Operator</option>
            <option value="advertiser">Advertiser</option>
          </select>
        </div>

        <Button
          onClick={() => setShowCreate((v) => !v)}
          className="bg-limebrand text-charcoal hover:bg-limebrand-500 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showCreate ? "Close Form" : "New Organization"}
        </Button>
      </div>

      {success && (
        <p className="rounded-lg border border-limebrand-600/30 bg-limebrand/20 px-4 py-2.5 text-sm text-charcoal">
          {success}
        </p>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-charcoal">
            Create Organization
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abuja Outdoor Media Ltd"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-type">Classification</Label>
              <select
                id="org-type"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "agency" | "operator" | "advertiser")
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="operator">Operator</option>
                <option value="advertiser">Advertiser</option>
                <option value="agency">Agency</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-email">Contact Email (optional)</Label>
              <Input
                id="org-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="ops@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-phone">Contact Phone (optional)</Label>
              <Input
                id="org-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No organizations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-charcoal">{org.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {org.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-charcoal">
                      {org.type}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal">
                      {org.memberCount}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`rounded-md px-2 py-0.5 font-medium ${
                          org.status === "active"
                            ? "bg-limebrand/25 text-charcoal"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="text-xs font-semibold text-charcoal hover:underline"
                      >
                        Inspect
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
