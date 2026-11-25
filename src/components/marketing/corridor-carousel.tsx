"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_ADVANCE_MS = 6500;

interface ShowcaseSlide {
  id: string;
  corridor: string;
  format: string;
  headline: string;
  description: string;
  image: string;
  alt: string;
}

const SLIDES: ShowcaseSlide[] = [
  {
    id: "cbd-garki-wuse",
    corridor: "CBD / Garki / Wuse",
    format: "Unipole & Static Corridors",
    headline: "Commercial arteries where daily business traffic converges.",
    description:
      "Face-level orientation, illumination checks, and operator-confirmed availability along Abuja's core commercial avenues.",
    image: "/images/corridor-1.jpg",
    alt: "Unipole billboard overlooking a Nigerian commercial road corridor",
  },
  {
    id: "airport-lugbe",
    corridor: "Airport Road / Lugbe",
    format: "Expressway Gantries",
    headline: "High-visibility spans built for long-approach readability.",
    description:
      "Structured gantry and highway placements mapped with GPS precision, approach direction, and dusk illumination verification.",
    image: "/images/corridor-2.jpg",
    alt: "Large-format roadside billboard along a Nigerian expressway corridor",
  },
  {
    id: "maitama-jabi",
    corridor: "Maitama / Mabushi / Jabi",
    format: "Digital LED & Urban Formats",
    headline: "Clean urban intersections with documented proof-of-posting.",
    description:
      "Every campaign placement is backed by dated, geotagged installation evidence and transparent operator rate confirmation.",
    image: "/images/corridor-3.jpg",
    alt: "Tree-lined urban corridor along Alex Ekwueme Way in Jabi, Abuja",
  },
];

function getRelativeOffset(index: number, activeIndex: number, length: number) {
  let diff = index - activeIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

export function CorridorCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const current = SLIDES[activeIndex];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActiveIndex((i) => (i + 1) % SLIDES.length);

  useEffect(() => {
    if (isPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
      const delta = touchStartX.current - endX;
      if (Math.abs(delta) > 40) {
        if (delta > 0) next();
        else prev();
      }
      touchStartX.current = null;
    }
    setIsPaused(false);
  };

  return (
    <section
      className="overflow-hidden bg-background py-14 sm:py-20 lg:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — matched to the 12-col editorial split above */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-charcoal sm:text-3xl lg:text-4xl">
              Built for real streets.{" "}
              <span className="text-muted-foreground">
                Verified at the face level.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-1">
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Explore Abuja&apos;s key outdoor corridors—each site mapped by structure,
              individual face orientation, and operator authorization.
            </p>
          </div>
        </div>

        {/* Outer Row: Slim Chevrons Outside the Stacked Carousel */}
        <div className="mx-auto mt-10 flex max-w-7xl items-center gap-2 sm:mt-14">
          {/* Desktop Left Chevron (Outside) */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous corridor slide"
            className="hidden h-14 w-10 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-charcoal md:inline-flex"
          >
            <ChevronLeft className="h-11 w-11" strokeWidth={1.25} />
          </button>

          {/* Stacked Horizontal Coverflow Carousel */}
          <div
            className="relative flex h-[250px] flex-1 items-center justify-center sm:h-[380px] md:h-[460px] lg:h-[520px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {SLIDES.map((slide, idx) => {
              const offset = getRelativeOffset(idx, activeIndex, SLIDES.length);
              const isActive = offset === 0;
              const isLeft = offset < 0;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View ${slide.corridor}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group absolute aspect-[16/10] w-[84%] max-w-[820px] transform-gpu overflow-hidden rounded-2xl bg-charcoal text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-limebrand sm:aspect-[16/9] sm:w-[74%] ${
                    isActive
                      ? "z-30 translate-x-0 scale-100 opacity-100 shadow-[0_20px_44px_-16px_rgba(22,23,26,0.28)]"
                      : isLeft
                        ? "z-20 -translate-x-[14%] scale-[0.86] cursor-pointer opacity-75 brightness-75 hover:opacity-90 sm:-translate-x-[21%] lg:-translate-x-[23%]"
                        : "z-20 translate-x-[14%] scale-[0.86] cursor-pointer opacity-75 brightness-75 hover:opacity-90 sm:translate-x-[21%] lg:translate-x-[23%]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full object-cover object-[50%_28%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-32 transition-opacity duration-500 ${
                      isActive
                        ? "bg-gradient-to-t from-black/75 via-black/30 to-transparent opacity-100"
                        : "inset-0 h-auto bg-charcoal/30 opacity-100"
                    }`}
                  />
                  <div
                    className={`absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-3 text-white transition-all duration-500 sm:bottom-6 sm:left-6 sm:right-6 ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-limebrand sm:text-xs">
                        {slide.format}
                      </p>
                      <p className="mt-0.5 font-sans text-base font-semibold sm:mt-1 sm:text-xl">
                        {slide.corridor}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-neutral-300">
                      0{activeIndex + 1} / 0{SLIDES.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Chevron (Outside) */}
          <button
            type="button"
            onClick={next}
            aria-label="Next corridor slide"
            className="hidden h-14 w-10 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-charcoal md:inline-flex"
          >
            <ChevronRight className="h-11 w-11" strokeWidth={1.25} />
          </button>
        </div>

        {/* Indicator Bars + Mobile Chevrons */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous corridor slide"
            className="inline-flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-charcoal md:hidden"
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={1.35} />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Corridor slides">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Select ${slide.corridor}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-sm transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-charcoal"
                      : "w-3 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next corridor slide"
            className="inline-flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-charcoal md:hidden"
          >
            <ChevronRight className="h-7 w-7" strokeWidth={1.35} />
          </button>
        </div>

        {/* Left-Aligned Corridor Caption + Right-Aligned CTA */}
        <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h3 className="font-sans text-lg font-semibold leading-snug text-charcoal sm:text-xl">
              {current.headline}
            </h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
              {current.description}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/atlas"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500 sm:w-auto"
            >
              Explore Inventory Map
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
