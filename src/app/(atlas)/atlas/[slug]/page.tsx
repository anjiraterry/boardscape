import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";
import { formatAzimuthCompass } from "@/modules/geospatial/abuja";

export const metadata = { title: "Face Detail — boardscape Atlas" };

export default async function AtlasFaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 space-y-5">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            boardscape Atlas
          </p>
          <h1 className="font-display text-3xl font-black tracking-tight text-charcoal sm:text-4xl">
            Face Detail ({slug})
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Configure Neon <code>DATABASE_URL</code> in <code>.env.local</code>{" "}
            to load published inventory details.
          </p>
          <Link
            href="/atlas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal underline decoration-limebrand decoration-2 underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Atlas
          </Link>
        </div>
      </section>
    );
  }

  const sql = getSql();
  const rows = await sql`
    SELECT
      f.id,
      f.slug,
      f.label,
      f.format,
      f.width_meters,
      f.height_meters,
      f.azimuth_deg,
      f.illumination,
      f.obstruction_level,
      f.road_direction,
      f.public_summary,
      f.last_confirmed_at,
      f.source_type,
      s.public_id,
      s.address,
      s.road_name,
      s.district,
      s.corridor,
      s.latitude,
      s.longitude
    FROM faces f
    INNER JOIN sites s ON s.id = f.site_id
    WHERE f.slug = ${slug}
      AND f.state = 'published'
    LIMIT 1
  `;

  const face = rows[0];
  if (!face) {
    notFound();
  }

  return (
    <div>
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-8">
          <Link
            href="/atlas"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Abuja Atlas
          </Link>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {String(face.district ?? "")} · {String(face.public_id ?? "")} ·
              Field Reviewed &amp; Operator Authorized
            </p>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-charcoal sm:text-5xl">
              {String(face.label)}
            </h1>
            <p className="font-sans text-base text-muted-foreground sm:text-lg">
              {String(face.address ?? "")} — Facing{" "}
              {String(face.road_direction)} traffic
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/brief?faces=${String(face.id)}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
            >
              Request Quote for This Face
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-charcoal-800 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                Dimensions
              </p>
              <p className="mt-2 font-sans text-lg font-semibold text-white">
                {String(face.width_meters)}m × {String(face.height_meters)}m
              </p>
            </div>
            <div className="rounded-xl bg-charcoal-800 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                Orientation
              </p>
              <p className="mt-2 font-sans text-lg font-semibold text-white">
                {formatAzimuthCompass(Number(face.azimuth_deg))}
              </p>
            </div>
            <div className="rounded-xl bg-charcoal-800 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                Illumination
              </p>
              <p className="mt-2 font-sans text-lg font-semibold capitalize text-white">
                {String(face.illumination)}
              </p>
            </div>
            <div className="rounded-xl bg-charcoal-800 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                Availability
              </p>
              <p className="mt-2 font-sans text-sm font-medium text-limebrand">
                {face.last_confirmed_at
                  ? `Confirmed ${new Date(String(face.last_confirmed_at)).toLocaleDateString("en-NG")}`
                  : "Requires operator reconfirmation"}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-charcoal-800 p-6 text-sm text-neutral-300">
            <p className="font-sans text-base font-semibold text-white">
              Data Provenance &amp; Transparency
            </p>
            <p className="leading-relaxed">
              Source:{" "}
              <code className="text-limebrand">{String(face.source_type)}</code>
              . Private operator contacts, internal rate cards, and permit scans
              are withheld from public listings. Availability and exact flight
              pricing are reconfirmed directly with the operator upon enquiry.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
