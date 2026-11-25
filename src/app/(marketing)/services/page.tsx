import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DoodleCtaSection } from "@/components/marketing/doodle-cta-section";

export const metadata = { title: "Services" };

const SERVICES = [
  {
    num: "01",
    title: "Campaign Strategy & Creative",
    body: "Brand positioning, outdoor messaging hierarchy, visual direction, and format-specific artwork adaptation.",
  },
  {
    num: "02",
    title: "OOH Media Planning & Buying",
    body: "District and corridor planning across Abuja, operator negotiation, rate verification, and flight scheduling.",
  },
  {
    num: "03",
    title: "Production & Installation Oversight",
    body: "Print specification, installer coordination, creative approval tracking, and deadline management.",
  },
  {
    num: "04",
    title: "Monitoring & Proof of Posting",
    body: "Geotagged installation verification, condition checks, and transparent post-campaign reporting.",
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Light Opening Editorial Section */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
              Strategy, media, and execution{" "}
              <span className="inline-block bg-limebrand px-2 py-0.5 text-charcoal">
                under one roof.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              From initial brand messaging to operator rate reconfirmation and
              geotagged proof-of-posting, every phase runs through one accountable
              team.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/brief"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
              >
                Request a Media & Creative Proposal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/atlas"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
              >
                Explore Inventory Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Charcoal Capabilities Grid */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Four integrated disciplines.{" "}
                <span className="text-neutral-400">Zero handoff gaps.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="font-sans text-sm leading-relaxed text-neutral-300">
                Creative adaptation, media buying, print supervision, and field
                monitoring operate on the same verified site record.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2">
            {SERVICES.map(({ num, title, body }) => (
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
