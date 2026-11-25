import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DoodleCtaSection } from "@/components/marketing/doodle-cta-section";

export const metadata = { title: "About boardscape" };

const PRINCIPLES = [
  {
    num: "01",
    title: "Why we exist",
    body: "Advertisers face fragmented outdoor inventory, inconsistent rates, uncertain availability, and limited proof of delivery. We combine human-led agency accountability with field-verified inventory software.",
  },
  {
    num: "02",
    title: "Operating principle",
    body: "We separate observed field data from modelled estimates, require explicit operator confirmation for rates and dates, and document every installation with time-stamped, geotagged proof.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Light Opening Editorial Section */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
              An independent advertising company powered by{" "}
              <span className="inline-block bg-limebrand px-2 py-0.5 text-charcoal">
                media intelligence.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              boardscape is built in Abuja, Nigeria to make the path from campaign
              idea to real-world execution clearer for brands, media owners, and
              agency partners.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/services"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500"
              >
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/atlas"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-charcoal px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800"
              >
                Open boardscape Atlas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Charcoal Contrast Section */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Built on accountability.{" "}
                <span className="text-neutral-400">Backed by field evidence.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="font-sans text-sm leading-relaxed text-neutral-300">
                Every listing, rate, and installation record carries explicit
                provenance—never assumed vacancy or unverified estimates.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2">
            {PRINCIPLES.map(({ num, title, body }) => (
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
