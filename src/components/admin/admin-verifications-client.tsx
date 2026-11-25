"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface VerificationItem {
  entityType: "survey" | "listing_authorization" | "permit_record";
  id: string;
  title: string;
  subtitle: string;
  status: string;
  documentPath: string | null;
  createdAt: string;
  flagLabel: string | null;
}

export function AdminVerificationsClient({
  items,
  canApprove,
}: {
  items: VerificationItem[];
  canApprove: boolean;
}) {
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submitDecision = async (
    item: VerificationItem,
    decision: "approve" | "reject"
  ) => {
    setError(null);
    setFeedback(null);
    setBusyId(item.id);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: item.entityType,
          id: item.id,
          decision,
          reason: decision === "reject" ? reason : undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Verification update failed.");
        return;
      }
      setRejectingId(null);
      setReason("");
      setFeedback(
        `${item.entityType.replace("_", " ")} ${decision === "approve" ? "approved" : "rejected"}.`
      );
      router.refresh();
    } catch {
      setError("Network error submitting verification decision.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
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

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No pending surveys, authorizations, or flagged compliance records.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item) => (
            <div
              key={`${item.entityType}-${item.id}`}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] text-charcoal">
                    {item.entityType}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                    {item.status}
                  </span>
                  {item.flagLabel && (
                    <span className="rounded bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      {item.flagLabel}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                {item.documentPath && (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Document: {item.documentPath}
                  </p>
                )}
              </div>

              {canApprove && (
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {rejectingId === item.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rejection reason (required)..."
                        className="h-8 w-64 text-xs"
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === item.id || reason.trim().length < 3}
                          onClick={() => submitDecision(item, "reject")}
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(null);
                            setReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => submitDecision(item, "approve")}
                        className="bg-limebrand text-charcoal hover:bg-limebrand-500 font-semibold"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => setRejectingId(item.id)}
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
