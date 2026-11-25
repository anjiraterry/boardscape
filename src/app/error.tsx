"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center space-y-4">
      <p className="font-mono text-xs uppercase tracking-widest text-mustard-600">
        Application Error
      </p>
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred while rendering this view.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
