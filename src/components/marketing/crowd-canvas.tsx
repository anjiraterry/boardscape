"use client";

import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";

interface CrowdCanvasProps {
  src: string;
  rows?: number;
  cols?: number;
  /** Cap visible simultaneous crowd members so individual reactions are readable. */
  maxCrowdSize?: number;
  /** Normalized horizontal positions (0..1) where billboards sit so passersby pause and look up. */
  billboardAnchors?: number[];
  className?: string;
}

interface Stage {
  width: number;
  height: number;
}

interface WalkProps {
  startX: number;
  startY: number;
  endX: number;
  direction: 1 | -1;
}

interface Peep {
  image: HTMLImageElement;
  rect: [number, number, number, number];
  baseWidth: number;
  baseHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  tiltDeg: number;
  isLooking: boolean;
  walk: gsap.core.Timeline | null;
  render: (ctx: CanvasRenderingContext2D) => void;
}

export function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
  maxCrowdSize = 18,
  billboardAnchors = [0.74],
  className = "h-full w-full",
}: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const randomRange = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const randomIndex = <T,>(array: T[]) => Math.floor(randomRange(0, array.length));
    const removeFromArray = <T,>(array: T[], i: number): T => array.splice(i, 1)[0];
    const removeItemFromArray = <T,>(array: T[], item: T): T =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = <T,>(array: T[]): T =>
      removeFromArray(array, randomIndex(array));

    // Exclude frames with three eyes, cyclops eye, knives, animal ears, or monster teeth
    const EXCLUDED_PEEP_INDICES = new Set([
      5, 7, 17, 21, 30, 48, 53, 58, 60, 61, 64, 66, 67, 72, 77, 82, 83, 84, 88, 92, 93, 97, 100,
    ]);

    const resetPeep = ({ stage, peep }: { stage: Stage; peep: Peep }): WalkProps => {
      const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      // Anchor every pedestrian deep enough at the bottom edge to compensate for sprite cell padding
      const startY = stage.height - peep.height * 0.74 + randomRange(0, peep.height * 0.08);
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width + peep.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = -peep.width;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;
      peep.tiltDeg = 0;
      peep.isLooking = false;

      return { startX, startY, endX, direction };
    };

    const walkWithBillboardNotice = ({
      peep,
      props,
      stage,
      slotIndex,
    }: {
      peep: Peep;
      props: WalkProps;
      stage: Stage;
      slotIndex: number;
    }) => {
      const { startX, startY, endX, direction } = props;
      const totalDuration = 18;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.55, 0.9));

      if (billboardAnchors.length === 0 || stage.width < 320) {
        tl.to(peep, { duration: totalDuration, x: endX, ease: "none" }, 0);
        tl.to(
          peep,
          {
            duration: 0.36,
            repeat: Math.floor(totalDuration / 0.36),
            yoyo: true,
            y: startY - 5,
          },
          0
        );
        return tl;
      }

      const anchorNorm =
        stage.width < 768
          ? 0.5
          : billboardAnchors[Math.floor(Math.random() * billboardAnchors.length)];
      const billboardX = anchorNorm * stage.width;
      // Every pedestrian picks a random, spaced-out spot along their walk to stop & look up
      const baseSlotNorm = 0.1 + ((slotIndex * 3) % 10) * 0.08;
      const stopNorm = Math.min(0.88, Math.max(0.08, baseSlotNorm + randomRange(-0.03, 0.03)));
      const stopX = stopNorm * stage.width;

      const totalDist = Math.abs(endX - startX) || 1;
      const leg1Ratio = Math.min(0.85, Math.max(0.12, Math.abs(stopX - startX) / totalDist));
      const leg1Dur = totalDuration * leg1Ratio;
      const pauseDur = randomRange(1.6, 3.0);
      const leg2Dur = totalDuration * (1 - leg1Ratio);
      const faceBillboardScale = stopX <= billboardX ? 1 : -1;
      const gazeTilt = faceBillboardScale === 1 ? -15 : 15;

      // Leg 1: walk naturally to notice position
      tl.to(peep, { duration: leg1Dur, x: stopX, ease: "power1.out" }, 0);
      tl.to(
        peep,
        {
          duration: 0.36,
          repeat: Math.max(1, Math.floor(leg1Dur / 0.36)),
          yoyo: true,
          y: startY - 5,
        },
        0
      );

      // Pause & smoothly turn + tilt head/body up toward the billboard
      tl.add(() => {
        peep.isLooking = true;
      }, leg1Dur);

      if (direction !== faceBillboardScale) {
        tl.to(
          peep,
          {
            duration: 0.5,
            scaleX: faceBillboardScale,
            tiltDeg: gazeTilt,
            ease: "power2.inOut",
          },
          leg1Dur
        );
        tl.to(
          peep,
          {
            duration: 0.5,
            scaleX: direction,
            tiltDeg: 0,
            ease: "power2.inOut",
          },
          leg1Dur + pauseDur - 0.5
        );
      } else {
        tl.to(
          peep,
          {
            duration: 0.45,
            tiltDeg: gazeTilt,
            ease: "power2.out",
          },
          leg1Dur
        );
        tl.to(
          peep,
          {
            duration: 0.4,
            tiltDeg: 0,
            ease: "power2.in",
          },
          leg1Dur + pauseDur - 0.4
        );
      }

      tl.add(() => {
        peep.isLooking = false;
      }, leg1Dur + pauseDur);

      // Leg 2: continue walking their way
      const leg2Start = leg1Dur + pauseDur;
      tl.to(peep, { duration: leg2Dur, x: endX, ease: "power1.in" }, leg2Start);
      tl.to(
        peep,
        {
          duration: 0.36,
          repeat: Math.max(1, Math.floor(leg2Dur / 0.36)),
          yoyo: true,
          y: startY - 5,
        },
        leg2Start
      );

      return tl;
    };

    const makePeep = (
      image: HTMLImageElement,
      rect: [number, number, number, number]
    ): Peep => {
      const baseWidth = rect[2];
      const baseHeight = rect[3];
      const width = baseWidth * 0.72;
      const height = baseHeight * 0.72;
      const peep: Peep = {
        image,
        rect,
        baseWidth,
        baseHeight,
        width,
        height,
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        tiltDeg: 0,
        isLooking: false,
        walk: null,
        render(context: CanvasRenderingContext2D) {
          context.save();
          // Pivot around bottom-center so tilting back to look up keeps feet/base grounded at the bottom
          context.translate(this.x + this.width * 0.5, this.y + this.height);
          if (this.tiltDeg !== 0) {
            context.rotate((this.tiltDeg * Math.PI) / 180);
          }
          context.scale(this.scaleX, 1);
          context.drawImage(
            this.image,
            this.rect[0],
            this.rect[1],
            this.rect[2],
            this.rect[3],
            -this.width * 0.5,
            -this.height,
            this.width,
            this.height
          );
          if (this.isLooking) {
            context.fillStyle = "#B5E62E";
            context.beginPath();
            const dotRadius = stage.width < 640 ? 3.2 : 4.5;
            context.arc(0, -this.height - 5, dotRadius, 0, Math.PI * 2);
            context.fill();
          }
          context.restore();
        },
      };
      return peep;
    };

    const img = document.createElement("img");
    const stage: Stage = { width: 0, height: 0 };
    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const createPeeps = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) return;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        if (EXCLUDED_PEEP_INDICES.has(i)) continue;
        allPeeps.push(
          makePeep(img, [
            (i % rows) * rectWidth,
            Math.floor(i / rows) * rectHeight,
            rectWidth,
            rectHeight,
          ])
        );
      }
    };

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    let noticeSlotCounter = 0;

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps);
      const slotIndex = noticeSlotCounter++;
      const walk = walkWithBillboardNotice({
        peep,
        props: resetPeep({ peep, stage }),
        stage,
        slotIndex,
      }).eventCallback("onComplete", () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      if (prefersReducedMotion) {
        walk.pause();
      }
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const getResponsiveCrowdConfig = (width: number) => {
      if (width < 480) return { scale: 0.42, count: Math.min(maxCrowdSize, 6) };
      if (width < 768) return { scale: 0.54, count: Math.min(maxCrowdSize, 9) };
      if (width < 1024) return { scale: 0.64, count: Math.min(maxCrowdSize, 13) };
      return { scale: 0.72, count: maxCrowdSize };
    };

    const initCrowd = () => {
      const { count } = getResponsiveCrowdConfig(stage.width);
      const targetCount = Math.min(count, availablePeeps.length);
      for (let i = 0; i < targetCount; i++) {
        addPeepToCrowd().walk?.progress(Math.random());
      }
    };

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      crowd.forEach((peep) => peep.render(ctx));
      ctx.restore();
    };

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;

      const { scale } = getResponsiveCrowdConfig(stage.width);
      allPeeps.forEach((peep) => {
        peep.width = peep.baseWidth * scale;
        peep.height = peep.baseHeight * scale;
      });

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);
      initCrowd();
      render();
    };

    let initialized = false;
    const init = () => {
      if (initialized) return;
      initialized = true;
      createPeeps();
      resize();
      if (!prefersReducedMotion) {
        gsap.ticker.add(render);
      }
    };

    img.onload = init;
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      init();
    }

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
    };
  }, [src, rows, cols, maxCrowdSize, billboardAnchors]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
