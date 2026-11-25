"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BoardscapeMark } from "@/components/brand/boardscape-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetupBootstrapPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [environment, setEnvironment] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("boardscape");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => r.json())
      .then((d: { bootstrapped?: boolean; environment?: string }) => {
        setBootstrapped(Boolean(d.bootstrapped));
        setEnvironment(d.environment ?? null);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, fullName, email, password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Unable to complete setup.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error during setup.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-display text-2xl font-black tracking-tight text-charcoal"
          >
            <BoardscapeMark variant="dark" className="h-8 w-auto" />
            <span>boardscape</span>
          </Link>
          <h1 className="mt-4 font-sans text-2xl font-semibold tracking-tight text-charcoal">
            Initial Super Admin Setup
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            One-time bootstrap to create the primary agency organization and
            initial Platform Super Admin credentials.
          </p>
          {environment && (
            <div className="mt-3 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-charcoal">
              Target Database Branch:{" "}
              <span className="font-mono font-semibold">{environment}</span>
            </div>
          )}
        </div>

        {checking ? (
          <p className="text-sm text-muted-foreground">
            Checking workspace status...
          </p>
        ) : bootstrapped ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-secondary p-4 text-sm text-charcoal">
              Initial administrator setup has already been completed for this
              environment.
            </p>
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-limebrand text-sm font-bold text-charcoal hover:bg-limebrand-500"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Administrator Full Name</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Administrator Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@boardscape.ng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min 10 characters)</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-lg bg-limebrand text-sm font-bold text-charcoal hover:bg-limebrand-500"
            >
              {submitting ? "Creating Administrator..." : "Complete Setup"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
