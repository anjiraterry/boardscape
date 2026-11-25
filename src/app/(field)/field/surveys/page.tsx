"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOfflineDrafts, type OfflineSurveyDraft } from "@/lib/offline-queue";
import { Badge } from "@/components/ui/badge";

export default function FieldSurveysPage() {
  const [drafts, setDrafts] = useState<OfflineSurveyDraft[]>([]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    listOfflineDrafts().then(setDrafts).catch(() => setDrafts([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl">Abuja Field Surveys</h1>
        <p className="text-sm text-muted-foreground">
          Offline-capable capture. Drafts persist locally until synced with an idempotent key.
        </p>
      </div>

      <Link
        href="/field/surveys/new"
        className="flex h-14 w-full items-center justify-center rounded-md bg-primary text-base font-medium text-primary-foreground"
      >
        Capture New Billboard Site
      </Link>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Local Drafts ({drafts.length})
          </h2>
          <Link href="/field/sync" className="text-xs font-medium text-accent hover:underline">
            Manage Sync →
          </Link>
        </div>

        {drafts.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
            No offline drafts stored on this device.
          </div>
        ) : (
          drafts.map((d) => (
            <div key={d.syncKey} className="rounded-md border border-border bg-card p-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{d.payload.address}</p>
                <Badge variant={d.status === "synced" ? "success" : "warning"}>{d.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {d.payload.district} · {d.payload.faces.length} face(s) · GPS ±{d.payload.gpsAccuracyMeters}m
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
