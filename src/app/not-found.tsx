import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center space-y-4">
      <p className="font-mono text-xs uppercase tracking-widest text-mustard-600">404</p>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The requested Boardscape page or listing could not be found.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-md bg-charcoal px-4 text-sm font-semibold text-white"
      >
        Return Home
      </Link>
    </div>
  );
}
