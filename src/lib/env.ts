export function getPublicEnv() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    mapStyleUrl:
      process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ??
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  };
}

export function getDatabaseUrl(): string {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY_VIOLATION: DATABASE_URL accessed in browser");
  }
  return process.env.DATABASE_URL ?? "";
}

export function isDatabaseConfigured(): boolean {
  if (typeof window !== "undefined") {
    return false;
  }
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(
    url &&
      !url.includes("ep-example") &&
      !url.includes("user:password")
  );
}

export function getAuthSecret(): string {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY_VIOLATION: AUTH_SECRET accessed in browser");
  }
  return (
    process.env.AUTH_SECRET ||
    process.env.DATABASE_URL ||
    "boardscape-local-dev-secret-change-me"
  );
}
