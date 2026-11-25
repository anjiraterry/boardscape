import Link from "next/link";

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/field/surveys" className="font-semibold tracking-tight">
            Boardscape Field
          </Link>
          <nav className="flex items-center gap-3 text-xs font-medium">
            <Link href="/field/surveys/new" className="rounded bg-accent px-3 py-1.5 text-accent-foreground">
              + New Survey
            </Link>
            <Link href="/field/sync" className="underline">
              Sync Queue
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 p-4">{children}</main>
    </div>
  );
}
