"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-charcoal">
            Administration View Error
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "Unable to load administrative data."}
          </p>
          <Button onClick={reset} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
