"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PlatformSettingsValues {
  platform_identity: {
    platformName: string;
    pilotRegion: string;
    supportEmail: string;
  };
  feature_flags: {
    publicAtlasEnabled: boolean;
    publicBriefIntakeEnabled: boolean;
    fieldOfflineQueueEnabled: boolean;
    operatorPortalEnabled: boolean;
  };
  operational_defaults: {
    surveyDuplicateRadiusMeters: number;
    maxGpsWarningMeters: number;
    quoteValidityDays: number;
  };
}

export function AdminSettingsClient({
  initialSettings,
}: {
  initialSettings: PlatformSettingsValues;
}) {
  const router = useRouter();
  const [identity, setIdentity] = useState(initialSettings.platform_identity);
  const [flags, setFlags] = useState(initialSettings.feature_flags);
  const [defaults, setDefaults] = useState(initialSettings.operational_defaults);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveSection = async (
    key: keyof PlatformSettingsValues,
    value: Record<string, string | number | boolean>
  ) => {
    setError(null);
    setMessage(null);
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Unable to save settings.");
        return;
      }
      setMessage(`Saved ${key.replace("_", " ")} and logged in audit trail.`);
      router.refresh();
    } catch {
      setError("Network error saving settings.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-limebrand-600/30 bg-limebrand/20 px-4 py-2 text-sm text-charcoal">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal">
          Platform Identity
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="set-name">Platform Name</Label>
            <Input
              id="set-name"
              value={identity.platformName}
              onChange={(e) =>
                setIdentity({ ...identity, platformName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-region">Pilot Region</Label>
            <Input
              id="set-region"
              value={identity.pilotRegion}
              onChange={(e) =>
                setIdentity({ ...identity, pilotRegion: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-email">Operations Support Email</Label>
            <Input
              id="set-email"
              type="email"
              value={identity.supportEmail}
              onChange={(e) =>
                setIdentity({ ...identity, supportEmail: e.target.value })
              }
            />
          </div>
        </div>
        <Button
          size="sm"
          disabled={savingKey === "platform_identity"}
          onClick={() => saveSection("platform_identity", identity)}
        >
          {savingKey === "platform_identity" ? "Saving..." : "Save Identity"}
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal">Feature Flags</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ["publicAtlasEnabled", "Public Atlas Discovery"],
              ["publicBriefIntakeEnabled", "Public Brief Intake (/brief)"],
              ["fieldOfflineQueueEnabled", "Field Offline Survey Queue"],
              ["operatorPortalEnabled", "Operator Portal"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
            >
              <span className="text-charcoal">{label}</span>
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) =>
                  setFlags({ ...flags, [key]: e.target.checked })
                }
                className="h-4 w-4 accent-charcoal"
              />
            </label>
          ))}
        </div>
        <Button
          size="sm"
          disabled={savingKey === "feature_flags"}
          onClick={() => saveSection("feature_flags", flags)}
        >
          {savingKey === "feature_flags" ? "Saving..." : "Save Feature Flags"}
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal">
          Operational Defaults
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="def-radius">Duplicate Survey Radius (meters)</Label>
            <Input
              id="def-radius"
              type="number"
              min={5}
              value={defaults.surveyDuplicateRadiusMeters}
              onChange={(e) =>
                setDefaults({
                  ...defaults,
                  surveyDuplicateRadiusMeters: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="def-gps">GPS Warning Threshold (meters)</Label>
            <Input
              id="def-gps"
              type="number"
              min={5}
              value={defaults.maxGpsWarningMeters}
              onChange={(e) =>
                setDefaults({
                  ...defaults,
                  maxGpsWarningMeters: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="def-quote">Default Quote Validity (days)</Label>
            <Input
              id="def-quote"
              type="number"
              min={1}
              value={defaults.quoteValidityDays}
              onChange={(e) =>
                setDefaults({
                  ...defaults,
                  quoteValidityDays: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <Button
          size="sm"
          disabled={savingKey === "operational_defaults"}
          onClick={() => saveSection("operational_defaults", defaults)}
        >
          {savingKey === "operational_defaults"
            ? "Saving..."
            : "Save Operational Defaults"}
        </Button>
      </section>
    </div>
  );
}
