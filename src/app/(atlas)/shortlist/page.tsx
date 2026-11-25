"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTLIST_STORAGE_KEY = "boardscape_shortlist_v1";

export default function ShortlistPage() {
  const [faceIds, setFaceIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      if (saved) setFaceIds(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  const clearAll = () => {
    setFaceIds([]);
    try {
      localStorage.removeItem(SHORTLIST_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Your Shortlist
            </h1>
          </div>
          {faceIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear Shortlist
            </Button>
          )}
        </div>

        {faceIds.length === 0 ? (
          <div className="space-y-4 rounded-2xl bg-card p-8 text-center shadow-sm sm:p-10">
            <p className="font-sans text-lg font-semibold text-charcoal">
              No faces saved yet.
            </p>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Browse boardscape Atlas to save candidate billboard faces for
              comparison and quotation.
            </p>
            <div className="pt-2">
              <Link
                href="/atlas"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
              >
                Explore Abuja Atlas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {faceIds.length} candidate face(s) selected. Converting this
              shortlist creates a CRM enquiry and operator quote request — it
              does not reserve inventory.
            </p>
            <ul className="divide-y divide-border font-mono text-sm">
              {faceIds.map((id) => (
                <li key={id} className="flex items-center justify-between py-3">
                  <span>Face ID: {id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = faceIds.filter((x) => x !== id);
                      setFaceIds(next);
                      localStorage.setItem(
                        SHORTLIST_STORAGE_KEY,
                        JSON.stringify(next)
                      );
                    }}
                    className="text-xs font-sans font-medium text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href={`/brief?faces=${faceIds.join(",")}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
            >
              Convert Shortlist to Campaign Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
