"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-charcoal text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Boardscape encountered an error</h1>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-mustard px-4 py-2 text-sm font-bold text-charcoal"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
