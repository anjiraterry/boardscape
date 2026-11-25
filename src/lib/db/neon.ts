import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/lib/env";

/**
 * Returns a Neon serverless SQL tagged-template client bound to `DATABASE_URL`.
 * Server-only: never import this module into Client Components.
 */
export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}
