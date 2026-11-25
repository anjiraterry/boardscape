"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewSurveyButtons({
  surveyId,
  currentStatus,
}: {
  surveyId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === "marked_distinct" || currentStatus === "merged_duplicate") {
    return <span className="text-xs text-muted-foreground">Reviewed</span>;
  }

  const submitDecision = async (decision: "marked_distinct" | "merged_duplicate") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/surveys/${surveyId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reviewReason:
            decision === "marked_distinct"
              ? "Confirmed distinct physical structure"
              : "Merged with existing nearby site",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Review failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => submitDecision("marked_distinct")}
        >
          Approve Distinct
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => submitDecision("merged_duplicate")}
        >
          Flag Duplicate
        </Button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
