"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ABUJA_DISTRICTS } from "@/modules/geospatial/abuja";
import { saveOfflineDraft } from "@/lib/offline-queue";
import { SurveySubmissionSchema, type SurveySubmissionInput } from "@/modules/surveys/schemas";

export default function NewFieldSurveyPage() {
  const router = useRouter();
  const [lat, setLat] = useState("9.0765");
  const [lng, setLng] = useState("7.3986");
  const [accuracy, setAccuracy] = useState("12");
  const [address, setAddress] = useState("");
  const [roadName, setRoadName] = useState("");
  const [district, setDistrict] = useState<string>(ABUJA_DISTRICTS[0]);
  const [operatorName, setOperatorName] = useState("");
  const [operatorContact, setOperatorContact] = useState("");
  const [notes, setNotes] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [faces, setFaces] = useState<SurveySubmissionInput["faces"]>([
    {
      label: "Face A (Inbound)",
      format: "unipole",
      widthMeters: 12,
      heightMeters: 4,
      azimuthDeg: 90,
      illumination: "frontlit",
      obstructionLevel: "clear",
      roadDirection: "Inbound CBD",
    },
  ]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is unavailable on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy).toString());
        setErrorMsg(null);
      },
      () => setErrorMsg("Unable to acquire GPS fix. Enter coordinates or retry outdoors."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const addFace = () => {
    setFaces((prev) => [
      ...prev,
      {
        label: `Face ${String.fromCharCode(65 + prev.length)}`,
        format: "unipole",
        widthMeters: 12,
        heightMeters: 4,
        azimuthDeg: 270,
        illumination: "frontlit",
        obstructionLevel: "clear",
        roadDirection: "Outbound",
      },
    ]);
  };

  const handleSave = async (syncNow: boolean) => {
    setErrorMsg(null);
    setStatusMsg(null);

    const syncKey = `srv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const candidate = {
      syncKey,
      recordedAt: new Date().toISOString(),
      latitude: Number(lat),
      longitude: Number(lng),
      gpsAccuracyMeters: Number(accuracy),
      address,
      roadName,
      district,
      structureType: "unipole",
      displayedOperatorName: operatorName || undefined,
      displayedOperatorContact: operatorContact || undefined,
      conditionNotes: notes || undefined,
      attachmentCount: photoNames.length,
      faces,
    };

    const parsed = SurveySubmissionSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Please complete all required fields.");
      return;
    }

    await saveOfflineDraft({
      syncKey,
      createdAt: new Date().toISOString(),
      status: "pending",
      attempts: 0,
      payload: parsed.data,
    });

    if (!syncNow) {
      setStatusMsg("Saved offline draft to device queue.");
      router.push("/field/sync");
      return;
    }

    try {
      const res = await fetch("/api/field/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatusMsg(`Saved offline (sync deferred: ${j.error ?? res.status})`);
        return;
      }
      setStatusMsg("Survey synced to Boardscape Studio.");
      router.push("/field/surveys");
    } catch {
      setStatusMsg("Offline mode: draft queued safely for later sync.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <h1 className="font-display text-3xl">New Billboard Survey</h1>

      <div className="rounded-md border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">1. Structure GPS & Location</p>
          <Button type="button" size="sm" variant="accent" onClick={captureGps}>
            Capture GPS
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Lat</Label>
            <Input value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div>
            <Label>Lng</Label>
            <Input value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
          <div>
            <Label>Accuracy (m)</Label>
            <Input value={accuracy} onChange={(e) => setAccuracy(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>District</Label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            {ABUJA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Road Name</Label>
          <Input value={roadName} onChange={(e) => setRoadName(e.target.value)} placeholder="e.g. Shehu Shagari Way" />
        </div>
        <div>
          <Label>Site Address / Landmark</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Opposite Transcorp Hilton" />
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">2. Advertising Faces ({faces.length})</p>
          <Button type="button" size="sm" variant="outline" onClick={addFace}>
            + Add Face
          </Button>
        </div>
        {faces.map((face, idx) => (
          <div key={idx} className="rounded border border-border p-3 space-y-2 text-sm">
            <Input
              value={face.label}
              onChange={(e) => {
                const next = [...faces];
                next[idx] = { ...face, label: e.target.value };
                setFaces(next);
              }}
              placeholder="Face label"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={face.widthMeters}
                onChange={(e) => {
                  const next = [...faces];
                  next[idx] = { ...face, widthMeters: Number(e.target.value) };
                  setFaces(next);
                }}
                placeholder="Width (m)"
              />
              <Input
                type="number"
                value={face.heightMeters}
                onChange={(e) => {
                  const next = [...faces];
                  next[idx] = { ...face, heightMeters: Number(e.target.value) };
                  setFaces(next);
                }}
                placeholder="Height (m)"
              />
              <Input
                type="number"
                value={face.azimuthDeg}
                onChange={(e) => {
                  const next = [...faces];
                  next[idx] = { ...face, azimuthDeg: Number(e.target.value) };
                  setFaces(next);
                }}
                placeholder="Azimuth 0-359"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">3. Displayed Operator & Notes</p>
        <Input
          value={operatorName}
          onChange={(e) => setOperatorName(e.target.value)}
          placeholder="Displayed operator name on structure"
        />
        <Input
          value={operatorContact}
          onChange={(e) => setOperatorContact(e.target.value)}
          placeholder="Displayed phone / email (kept private)"
        />
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Structure condition, lighting, or obstruction notes..."
        />
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="survey-photos">Site & Face Photographs (required)</Label>
          <input
            id="survey-photos"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setPhotoNames(files.map((f) => f.name));
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium"
          />
          {photoNames.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Attached ({photoNames.length}): {photoNames.join(", ")}
            </p>
          )}
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div role="status" className="rounded-md border border-emerald-700/30 bg-emerald-50 p-3 text-sm text-emerald-900">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" size="lg" onClick={() => handleSave(false)}>
          Save Offline Draft
        </Button>
        <Button type="button" size="lg" onClick={() => handleSave(true)}>
          Submit Survey
        </Button>
      </div>
    </div>
  );
}
