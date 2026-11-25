"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_METADATA, type AppRole } from "@/modules/identity/schemas";

export function AdminUserDetailClient({
  userId,
  currentStatus,
  currentRole,
  currentOrgId,
  organizations,
  assignableRoles,
  canAssignRoles,
  canSuspend,
}: {
  userId: string;
  currentStatus: string;
  currentRole: AppRole | null;
  currentOrgId: string | null;
  organizations: { id: string; name: string; type: string }[];
  assignableRoles: AppRole[];
  canAssignRoles: boolean;
  canSuspend: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(currentRole ?? assignableRoles[0] ?? "surveyor");
  const [organizationId, setOrganizationId] = useState(
    currentOrgId ?? organizations[0]?.id ?? ""
  );
  const [reason, setReason] = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_role",
          role,
          organizationId,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Unable to update role.");
        return;
      }
      setFeedback("Role and organization membership updated.");
      router.refresh();
    } catch {
      setError("Network error updating role.");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (action: "suspend" | "reactivate") => {
    setError(null);
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "suspend" ? reason : undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? `Unable to ${action} account.`);
        return;
      }
      setConfirmSuspend(false);
      setReason("");
      setFeedback(
        action === "suspend" ? "Account suspended." : "Account reactivated."
      );
      router.refresh();
    } catch {
      setError("Network error updating account status.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
      {feedback && (
        <p className="rounded-lg border border-limebrand-600/30 bg-limebrand/20 px-4 py-2.5 text-sm text-charcoal">
          {feedback}
        </p>
      )}

      {canAssignRoles && (
        <form
          onSubmit={handleAssignRole}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-charcoal">
            Role & Organization Membership
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="detail-role">Role</Label>
              <select
                id="detail-role"
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
              <Label htmlFor="detail-org">Organization</Label>
              <select
                id="detail-org"
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
          <Button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Update Membership"}
          </Button>
        </form>
      )}

      {canSuspend && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-charcoal">
            Account Access Control
          </h2>
          {currentStatus === "active" ? (
            confirmSuspend ? (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Confirm Account Suspension
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suspend-reason">
                    Suspension Reason (recorded in audit log)
                  </Label>
                  <Input
                    id="suspend-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Policy violation, offboarding, etc."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={busy || reason.trim().length < 3}
                    onClick={() => handleStatusChange("suspend")}
                  >
                    {busy ? "Suspending..." : "Confirm Suspend"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmSuspend(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmSuspend(true)}
              >
                Suspend Account
              </Button>
            )
          ) : (
            <Button
              type="button"
              disabled={busy}
              onClick={() => handleStatusChange("reactivate")}
            >
              {busy ? "Reactivating..." : "Reactivate Account"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
