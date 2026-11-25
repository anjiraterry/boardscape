import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DoodleCtaSection } from "@/components/marketing/doodle-cta-section";

export const metadata = { title: "boardscape Atlas" };

const ATLAS_PILLARS = [
  {
    num: "01",
    title: "Map-First Discovery",
    body: "Browse field-collected Abuja outdoor structures by district, corridor, format, and illumination directly on an interactive map.",
  },
  {
    num: "02",
    title: "Confirmation Freshness",
    body: "Every listing carries explicit operator confirmation timestamps so planning teams know how current rate and availability records are.",
  },
  {
    num: "03",
    title: "Shortlist to Quotation",
    body: "Group individual advertising faces into a campaign shortlist and initiate verified operator quotation requests in one workflow.",
  },
];

export default function AtlasOverviewPage() {
  return (
    <div>
      {/* Light Opening Editorial Section */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
              boardscape{" "}
              <span className="inline-block bg-limebrand px-2 py-0.5 text-charcoal">
                Atlas.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              boardscape Atlas organizes field-collected outdoor advertising
              locations into a map-first planning workspace. Compare formats,
              orientations, dimensions, and confirmation freshness, build
              shortlists, and initiate verified quotation requests.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/atlas"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
              >
                Launch boardscape Atlas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/brief"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
              >
                Submit Campaign Brief
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Charcoal Feature Grid */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Built for outdoor planners.{" "}
                <span className="text-neutral-400">Grounded in field data.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="font-sans text-sm leading-relaxed text-neutral-300">
                No scraped spreadsheets or stale rate cards—just structured,
                operator-confirmed face inventory.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {ATLAS_PILLARS.map(({ num, title, body }) => (
              <div
                key={num}
                className="rounded-xl bg-charcoal-800 p-6 sm:p-8"
              >
                <span className="font-mono text-sm font-semibold text-limebrand">
                  {num}
                </span>
                <h3 className="mt-5 font-sans text-xl font-semibold tracking-tight text-white">
                  {title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-300">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DoodleCtaSection />
    </div>
  );
}
