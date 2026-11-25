import { Badge } from "@/components/ui/badge";
import { PublishFaceButton } from "@/components/studio/publish-face-button";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata = { title: "Inventory — boardscape Studio" };

export default async function StudioInventoryPage() {
  const faces = isDatabaseConfigured()
    ? await getSql()`
        SELECT
          f.id,
          f.label,
          f.format,
          f.state,
          f.width_meters,
          f.height_meters,
          s.public_id,
          s.district,
          s.road_name
        FROM faces f
        LEFT JOIN sites s ON s.id = f.site_id
        ORDER BY f.created_at DESC
        LIMIT 50
      `
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Billboard Inventory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sites and advertising faces. Publication requires active operator
          listing authorization (FR-008/FR-009).
        </p>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-charcoal font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-300">
            <tr>
              <th className="p-4 font-medium">Face Label</th>
              <th className="p-4 font-medium">District / Road</th>
              <th className="p-4 font-medium">Format</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium">Lifecycle State</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {faces.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No inventory records loaded. Submit field surveys via
                  /field/surveys/new.
                </td>
              </tr>
            ) : (
              faces.map((f) => (
                <tr key={String(f.id)}>
                  <td className="p-4 font-medium">{String(f.label)}</td>
                  <td className="p-4 text-muted-foreground">
                    {String(f.district ?? "")} · {String(f.road_name ?? "")}
                  </td>
                  <td className="p-4">{String(f.format)}</td>
                  <td className="p-4 font-mono">
                    {String(f.width_meters)}m × {String(f.height_meters)}m
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={f.state === "published" ? "success" : "secondary"}
                    >
                      {String(f.state)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <PublishFaceButton
                      faceId={String(f.id)}
                      currentState={String(f.state)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
