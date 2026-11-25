import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BillboardCrowdHero } from "@/components/marketing/billboard-crowd-hero";
import { CorridorCarousel } from "@/components/marketing/corridor-carousel";
import { DoodleCtaSection } from "@/components/marketing/doodle-cta-section";

const PILLARS = [
  {
    num: "01",
    title: "Creative & Strategy",
    body: "Brand positioning, campaign concepts, outdoor copy, and production adaptations built for physical corridors and digital amplification.",
    href: "/services",
    cta: "See creative services",
  },
  {
    num: "02",
    title: "Media Planning & Buying",
    body: "Structured site selection, direct operator rate reconfirmation, transparent fee structures, and flight scheduling.",
    href: "/atlas",
    cta: "Explore Atlas",
  },
  {
    num: "03",
    title: "Verified Execution & Proof",
    body: "Production oversight, creative approval checklists, geotagged proof-of-posting, and post-campaign reporting with honest provenance.",
    href: "/outdoor-advertising",
    cta: "How we verify",
  },
];

export default function HomePage() {
  return (
    <div>
      <BillboardCrowdHero />

      {/* Charcoal Follow-Up Section */}
      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                One accountable partner.{" "}
                <span className="text-neutral-400">From concept to street.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="font-sans text-sm leading-relaxed text-neutral-300">
                Most outdoor campaigns break between strategy, media buying, and
                what actually goes up on the board. We run all three under one roof.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {PILLARS.map(({ num, title, body, href, cta }) => (
              <Link
                key={num}
                href={href}
                className="group flex flex-col justify-between rounded-xl bg-charcoal-800 p-6 transition-transform duration-200 hover:-translate-y-1 hover:bg-neutral-800/90 sm:p-8"
              >
                <div>
                  <span className="font-mono text-sm font-semibold text-limebrand">
                    {num}
                  </span>
                  <h3 className="mt-6 font-sans text-xl font-semibold tracking-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-300">
                    {body}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-limebrand">
                  <span>{cta}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Corridor & Format Carousel */}
      <CorridorCarousel />

      {/* Dark Doodle Pre-Footer CTA fading smoothly into SiteFooter */}
      <DoodleCtaSection />
    </div>
  );
}
