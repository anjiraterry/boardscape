"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminOrgStatusToggle({
  orgId,
  orgType,
  currentStatus,
}: {
  orgId: string;
  orgType: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = currentStatus === "active" ? "suspended" : "active";

  const handleToggle = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to update organization status.");
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Network error updating organization status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
            currentStatus === "active"
              ? "bg-limebrand/25 text-charcoal"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {currentStatus}
        </span>

        {orgType !== "agency" &&
          (confirming ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={nextStatus === "suspended" ? "destructive" : "default"}
                disabled={busy}
                onClick={handleToggle}
              >
                {busy
                  ? "Saving..."
                  : nextStatus === "suspended"
                    ? "Confirm Suspend"
                    : "Confirm Reactivate"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant={currentStatus === "active" ? "outline" : "default"}
              onClick={() => setConfirming(true)}
            >
              {currentStatus === "active"
                ? "Suspend Organization"
                : "Reactivate Organization"}
            </Button>
          ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
