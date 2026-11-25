"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PublishFaceButton({
  faceId,
  currentState,
}: {
  faceId: string;
  currentState: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentState === "published") {
    return <span className="text-xs text-muted-foreground">Live on Atlas</span>;
  }

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/faces/${faceId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: "Verified in Studio moderation queue" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Cannot publish");
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
      <Button size="sm" variant="outline" onClick={handlePublish} disabled={loading}>
        {loading ? "Publishing..." : "Publish"}
      </Button>
      {error && <p className="text-[11px] text-destructive max-w-[200px]">{error}</p>}
    </div>
  );
}
