"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, ChevronDown, MapPin, Search } from "lucide-react";
import { AtlasMap } from "@/components/atlas/atlas-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ABUJA_DISTRICTS, formatAzimuthCompass } from "@/modules/geospatial/abuja";
import type { PublicFaceListing } from "@/modules/inventory/schemas";

const SHORTLIST_STORAGE_KEY = "boardscape_shortlist_v1";

export function AtlasExplorer() {
  const [faces, setFaces] = useState<PublicFaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [district, setDistrict] = useState("");
  const [format, setFormat] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      if (saved) setShortlist(JSON.parse(saved));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      const qs = new URLSearchParams();
      if (district) qs.set("district", district);
      if (format) qs.set("format", format);
      if (keyword) qs.set("keyword", keyword);

      try {
        const res = await fetch(`/api/atlas/faces?${qs.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setFaces(json.faces ?? []);
        setConfigured(Boolean(json.configured));
      } catch {
        // Ignore abort errors
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [district, format, keyword]);

  const toggleShortlist = (faceId: string) => {
    setShortlist((prev) => {
      const next = prev.includes(faceId)
        ? prev.filter((id) => id !== faceId)
        : [...prev, faceId];
      try {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-6">
        {/* Compact Editorial Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              Atlas
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shortlist"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-charcoal px-4 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
            >
              <Bookmark className="h-4 w-4 text-limebrand" />
              Shortlist ({shortlist.length})
            </Link>
            <Link
              href="/brief"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-limebrand px-4 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
            >
              Submit Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Search & Button-Styled Filters (directly on canvas, no card wrapper) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search road, district, or face label..."
              className="h-10 rounded-lg border-0 bg-card pl-10 shadow-sm"
              aria-label="Search inventory"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                aria-label="Filter by Abuja district"
                className="h-10 cursor-pointer appearance-none rounded-lg bg-charcoal pl-4 pr-9 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limebrand"
              >
                <option value="">All Abuja Districts</option>
                {ABUJA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-neutral-300"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                aria-label="Filter by format"
                className="h-10 cursor-pointer appearance-none rounded-lg bg-charcoal pl-4 pr-9 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limebrand"
              >
                <option value="">All Formats</option>
                <option value="static_billboard">Static Billboard</option>
                <option value="unipole">Unipole</option>
                <option value="gantry">Gantry</option>
                <option value="rooftop">Rooftop</option>
                <option value="digital_led">Digital LED</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-neutral-300"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Synchronized Map & List */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl shadow-sm lg:col-span-7">
            <AtlasMap
              faces={faces}
              selectedFaceId={selectedFaceId}
              onSelectFace={setSelectedFaceId}
            />
          </div>

          <div className="space-y-3 pr-1 lg:col-span-5 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
            {loading ? (
              <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-sm">
                Loading published Abuja inventory...
              </div>
            ) : faces.length === 0 ? (
              <div className="space-y-3 rounded-2xl bg-card p-6 shadow-sm">
                <p className="font-sans text-base font-semibold text-charcoal">
                  No published faces match your current filters.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {configured
                    ? "Atlas only displays billboard faces that have completed field verification and operator listing authorization."
                    : "Database connection is not configured in .env.local yet. Once Neon DATABASE_URL is connected and faces are published in Studio, they will appear here."}
                </p>
                <Link
                  href="/brief"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal underline decoration-limebrand decoration-2 underline-offset-4 hover:text-charcoal-800"
                >
                  Submit a custom Abuja campaign brief instead
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              faces.map((face) => {
                const isSelected = selectedFaceId === face.faceId;
                const isSaved = shortlist.includes(face.faceId);
                return (
                  <div
                    key={face.faceId}
                    onClick={() => setSelectedFaceId(face.faceId)}
                    className={`cursor-pointer rounded-2xl p-5 transition-all ${
                      isSelected
                        ? "bg-charcoal text-white shadow-md"
                        : "bg-card text-foreground shadow-sm hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`font-mono text-[11px] uppercase tracking-wider ${
                            isSelected ? "text-limebrand" : "text-muted-foreground"
                          }`}
                        >
                          {face.district} · {face.format.replace("_", " ")}
                        </p>
                        <h2
                          className={`mt-1 font-sans text-base font-semibold ${
                            isSelected ? "text-white" : "text-charcoal"
                          }`}
                        >
                          {face.label}
                        </h2>
                        <p
                          className={`mt-0.5 flex items-center gap-1 text-xs ${
                            isSelected ? "text-neutral-300" : "text-muted-foreground"
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {face.roadName} ({face.roadDirection})
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={isSaved ? "default" : "outline"}
                        size="sm"
                        className={
                          isSaved
                            ? "bg-limebrand font-bold text-charcoal hover:bg-limebrand-500"
                            : isSelected
                              ? "border-white/20 bg-transparent text-white hover:bg-white/10"
                              : ""
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(face.faceId);
                        }}
                      >
                        {isSaved ? "Saved" : "Save"}
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="secondary"
                        className={isSelected ? "bg-charcoal-800 text-neutral-200" : ""}
                      >
                        {face.widthMeters}m × {face.heightMeters}m
                      </Badge>
                      <Badge
                        variant="outline"
                        className={isSelected ? "border-white/20 text-neutral-200" : ""}
                      >
                        {formatAzimuthCompass(face.azimuthDeg)}
                      </Badge>
                      <Badge variant="warning">{face.availabilityLabel}</Badge>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/atlas/${face.slug}`}
                        className={`text-xs font-semibold hover:underline ${
                          isSelected ? "text-limebrand" : "text-charcoal"
                        }`}
                      >
                        View face details →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
