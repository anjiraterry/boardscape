"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Search, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AdminInventoryRow {
  faceId: string;
  label: string;
  format: string;
  state: string;
  availability: string;
  siteId: string;
  siteTitle: string;
  corridor: string;
  district: string;
  operatorName: string | null;
  authStatus: string | null;
  evidenceCount: number;
  hasDuplicateWarning: boolean;
  updatedAt: string;
}

export function AdminInventoryClient({
  items,
  canReview,
}: {
  items: AdminInventoryRow[];
  canReview: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.siteTitle.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.corridor.toLowerCase().includes(q) ||
      (item.operatorName ?? "").toLowerCase().includes(q);
    const matchesState = stateFilter === "all" || item.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const handleUnpublish = async (faceId: string) => {
    setError(null);
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inventory/${faceId}/unpublish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Unable to unpublish listing.");
        return;
      }
      setUnpublishingId(null);
      setReason("");
      setFeedback("Listing unpublished and recorded in audit log.");
      router.refresh();
    } catch {
      setError("Network error unpublishing listing.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search site, face, corridor, operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by face state"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All States</option>
          <option value="published">Published</option>
          <option value="unverified">Unverified</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {feedback && (
        <p className="rounded-lg border border-limebrand-600/30 bg-limebrand/20 px-4 py-2 text-sm text-charcoal">
          {feedback}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Site & Face</th>
                <th className="px-4 py-3 font-medium">Operator / Auth</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Warnings</th>
                <th className="px-4 py-3 font-medium text-right">Oversight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No inventory faces match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.faceId} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">
                        {item.siteTitle} — {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.corridor} · {item.district} · {item.format}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="text-charcoal">
                        {item.operatorName ?? "Unassigned"}
                      </p>
                      <p className="text-muted-foreground">
                        Auth: {item.authStatus ?? "none"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal">
                      {item.evidenceCount} file(s)
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`rounded-md px-2 py-0.5 font-medium ${
                          item.state === "published"
                            ? "bg-limebrand/25 text-charcoal"
                            : item.state === "suspended"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-secondary text-charcoal"
                        }`}
                      >
                        {item.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.hasDuplicateWarning ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Duplicate check
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Clear</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canReview && item.state !== "suspended" ? (
                        unpublishingId === item.faceId ? (
                          <div className="flex flex-col items-end gap-2">
                            <Input
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Reason for unpublishing..."
                              className="h-8 w-56 text-xs"
                            />
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busy || reason.trim().length < 3}
                                onClick={() => handleUnpublish(item.faceId)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setUnpublishingId(null);
                                  setReason("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUnpublishingId(item.faceId)}
                          >
                            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                            Unpublish
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
