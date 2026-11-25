"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteOfflineDraft,
  listOfflineDrafts,
  saveOfflineDraft,
  type OfflineSurveyDraft,
} from "@/lib/offline-queue";

export default function FieldSyncPage() {
  const [drafts, setDrafts] = useState<OfflineSurveyDraft[]>([]);

  const reload = () => {
    listOfflineDrafts().then(setDrafts).catch(() => setDrafts([]));
  };

  useEffect(() => {
    reload();
  }, []);

  const syncDraft = async (draft: OfflineSurveyDraft) => {
    await saveOfflineDraft({ ...draft, status: "syncing", attempts: draft.attempts + 1 });
    reload();
    try {
      const res = await fetch("/api/field/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft.payload),
      });
      if (res.ok) {
        await deleteOfflineDraft(draft.syncKey);
      } else {
        const j = await res.json().catch(() => ({}));
        await saveOfflineDraft({
          ...draft,
          status: res.status === 409 ? "conflict" : "error",
          attempts: draft.attempts + 1,
          lastError: j.error ?? `HTTP ${res.status}`,
        });
      }
    } catch {
      await saveOfflineDraft({
        ...draft,
        status: "error",
        attempts: draft.attempts + 1,
        lastError: "Network unreachable",
      });
    }
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Offline Sync Queue</h1>
        <p className="text-sm text-muted-foreground">
          Replaying a submission uses its unique <code>syncKey</code> so duplicate database records are never created (FR-006).
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          All local surveys are synced.
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <div key={d.syncKey} className="rounded-md border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{d.payload.address}</p>
                <Badge variant={d.status === "error" ? "warning" : "secondary"}>{d.status}</Badge>
              </div>
              {d.lastError && <p className="text-xs text-destructive">{d.lastError}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => syncDraft(d)}>
                  Retry Sync
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await deleteOfflineDraft(d.syncKey);
                    reload();
                  }}
                >
                  Discard
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
