"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CrowdCanvas } from "@/components/marketing/crowd-canvas";
import { BillboardIllustration } from "@/components/marketing/hero/billboard-illustration";

const PEEPS_SPRITE_SRC = "/images/peeps-sprite.png";
const BILLBOARD_ANCHORS = [0.74];

export function BillboardCrowdHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between overflow-hidden bg-background text-foreground md:block md:min-h-0">
      {/* Layer 4: Hero Headline & Interactive CTAs (pointer-events-none wrapper so mouse reaches billboard) */}
      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-7xl px-4 pt-12 pb-4 sm:px-6 sm:pt-14 md:pb-36 lg:px-8 lg:pt-20 lg:pb-40">
        <div className="pointer-events-auto max-w-xl lg:max-w-2xl">
          <h1 className="font-display text-[2rem] font-black leading-[1.04] tracking-tight text-charcoal sm:text-5xl md:text-6xl lg:text-7xl">
            We make you{" "}
            <span className="inline-block bg-limebrand px-2 py-0.5 text-charcoal sm:px-2.5">
              impossible to ignore.
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Ideas worth noticing. Media chosen with purpose. Campaigns executed with care.
            boardscape is an independent advertising company combining creative strategy,
            media buying, outdoor execution, and our proprietary intelligence platform,
            boardscape Atlas.
          </p>

          <div className="mt-5 flex w-full items-stretch gap-2.5 sm:mt-8 sm:w-auto sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/brief"
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-limebrand px-3 text-[11px] font-bold text-charcoal transition-colors hover:bg-limebrand-500 sm:h-12 sm:flex-none sm:gap-2 sm:px-6 sm:text-sm"
            >
              Start a Campaign Brief
              <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </Link>
            <Link
              href="/atlas"
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-charcoal px-3 text-[11px] font-semibold text-white transition-colors hover:bg-charcoal-800 sm:h-12 sm:flex-none sm:gap-2 sm:px-6 sm:text-sm"
            >
              Explore boardscape Atlas
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet bottom stage so pole reaches bottom-0 and billboard fills negative space */}
      <div className="relative h-[305px] w-full shrink-0 sm:h-[350px] md:static md:mt-0 md:h-auto">
        {/* Layer 2: Interactive Billboard — pole anchored strictly to bottom-0 on all screens */}
        <div className="absolute bottom-0 left-1/2 z-0 w-[375px] -translate-x-1/2 sm:w-[440px] md:left-auto md:right-6 md:w-[500px] md:translate-x-0 lg:right-8 lg:w-[620px] xl:right-14 xl:w-[680px]">
          <BillboardIllustration className="block h-auto w-full" />
        </div>

        {/* Layer 3: Crowd Illustration (foreground mask over pole) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[135px] w-full sm:h-[165px] md:relative md:-mt-28 md:h-[240px] lg:-mt-32 lg:h-[260px]">
          <CrowdCanvas
            src={PEEPS_SPRITE_SRC}
            rows={15}
            cols={7}
            maxCrowdSize={18}
            billboardAnchors={BILLBOARD_ANCHORS}
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
