"use client";

import { useEffect, useRef, useState } from "react";
import SidebarNav from "./SidebarNav";
import SyncOrb from "./SyncOrb";

export type Verse = {
  id: number;
  text: string;
  translation: string;
};

type HomeContentProps = {
  verses: Verse[];
  surahNumber: number;
  surahTransliteration: string;
};

const VIEWPORT_ANCHOR_RATIO = 0.38;
const TOP_EDGE_SPACER = "0px";
const BOTTOM_EDGE_SPACER = "calc(62vh + 14rem)";
const SCROLL_END_TOLERANCE_PX = 1;
const NEAR_TARGET_TOLERANCE_PX = 12;
const SCROLL_STABLE_FRAMES = 3;
const SCROLL_LOCK_MAX_MS = 1800;

export default function HomeContent({
  verses,
  surahNumber,
  surahTransliteration,
}: HomeContentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const scrollSettleRafRef = useRef<number | null>(null);
  const scrollTickRafRef = useRef<number | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const getClosestIndexToAnchor = () => {
      const anchorY = window.innerHeight * VIEWPORT_ANCHOR_RATIO;
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - anchorY);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = idx;
        }
      });

      return best;
    };

    const syncActiveFromViewport = () => {
      if (scrollTickRafRef.current !== null) return;
      scrollTickRafRef.current = window.requestAnimationFrame(() => {
        scrollTickRafRef.current = null;
        if (isProgrammaticScrollRef.current) return;
        const best = getClosestIndexToAnchor();
        if (best !== -1 && best !== activeIndexRef.current) {
          setActiveIndex(best);
        }
      });
    };

    syncActiveFromViewport();
    window.addEventListener("scroll", syncActiveFromViewport, { passive: true });
    window.addEventListener("resize", syncActiveFromViewport);

    return () => {
      window.removeEventListener("scroll", syncActiveFromViewport);
      window.removeEventListener("resize", syncActiveFromViewport);
      if (scrollTickRafRef.current !== null) {
        window.cancelAnimationFrame(scrollTickRafRef.current);
        scrollTickRafRef.current = null;
      }
    };
  }, [verses.length]);

  useEffect(() => {
    return () => {
      if (scrollSettleRafRef.current !== null) {
        window.cancelAnimationFrame(scrollSettleRafRef.current);
      }
      if (scrollTickRafRef.current !== null) {
        window.cancelAnimationFrame(scrollTickRafRef.current);
      }
    };
  }, []);

  const scrollToVerse = (index: number) => {
    const el = sectionRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rawTargetY =
      window.scrollY +
      rect.top +
      rect.height / 2 -
      window.innerHeight * VIEWPORT_ANCHOR_RATIO;
    const maxScrollY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const targetY = Math.min(Math.max(0, rawTargetY), maxScrollY);
    const isEdgeCase = targetY === 0 || targetY === maxScrollY;
    const settleTolerance = isEdgeCase
      ? NEAR_TARGET_TOLERANCE_PX
      : SCROLL_END_TOLERANCE_PX;

    if (scrollSettleRafRef.current !== null) {
      window.cancelAnimationFrame(scrollSettleRafRef.current);
      scrollSettleRafRef.current = null;
    }

    isProgrammaticScrollRef.current = true;
    setActiveIndex(index);

    // Use double requestAnimationFrame to let React's render complete before scrolling
    // This prevents the smooth scroll from being cancelled by re-renders
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    });

    const lockStart = performance.now();
    let stableFrameCount = 0;
    let lastY = window.scrollY;

    const checkSettle = () => {
      const currentY = window.scrollY;
      const distanceToTarget = Math.abs(currentY - targetY);
      const reachedTarget = distanceToTarget <= settleTolerance;
      const barelyMoving =
        Math.abs(currentY - lastY) <= SCROLL_END_TOLERANCE_PX;

      if (
        reachedTarget ||
        (barelyMoving && distanceToTarget <= NEAR_TARGET_TOLERANCE_PX)
      ) {
        stableFrameCount += 1;
      } else {
        stableFrameCount = 0;
      }

      const exceededMaxLock = performance.now() - lockStart >= SCROLL_LOCK_MAX_MS;
      if (stableFrameCount >= SCROLL_STABLE_FRAMES || exceededMaxLock) {
        isProgrammaticScrollRef.current = false;
        scrollSettleRafRef.current = null;
        return;
      }

      lastY = currentY;
      scrollSettleRafRef.current = window.requestAnimationFrame(checkSettle);
    };

    scrollSettleRafRef.current = window.requestAnimationFrame(checkSettle);
  };

  return (
    <div className="relative min-h-svh font-sans">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/green-wide.jpg)" }}
        aria-hidden
      />

      {/* Overall readability overlay */}
      <div className="fixed inset-0 bg-(--background)/50" aria-hidden />

      {/* Sidebar — rendered outside the mask so it's always visible */}
      <SidebarNav
        activeIndex={activeIndex}
        totalItems={verses.length}
        onItemClick={scrollToVerse}
        surahNumber={surahNumber}
        surahTransliteration={surahTransliteration}
      />

      {/* Content */}
      <main className="relative flex min-h-svh items-start justify-center">
        <div
          className="flex w-full max-w-2xl flex-col items-center px-6 pt-24 sm:pt-32 mb-4"
          style={{
            paddingBottom: "calc(234px + env(safe-area-inset-bottom))",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 260px), rgba(0,0,0,0.85) calc(100% - 230px), transparent calc(100% - 170px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 260px), rgba(0,0,0,0.85) calc(100% - 230px), transparent calc(100% - 170px), transparent 100%)",
          }}
        >
          <header className="mb-16 text-center">
            <h1
              className="font-arabic text-6xl font-bold leading-relaxed text-foreground"
              dir="rtl"
            >
              الفاتحة
            </h1>
            <p className="mt-1 text-lg tracking-widest text-white uppercase">
              The Opener
            </p>
          </header>

          <div className="flex w-full flex-col gap-24">
            <div
              className="pointer-events-none"
              style={{ height: TOP_EDGE_SPACER }}
              aria-hidden
            />
            {verses.map((verse, i) => (
              <article
                key={verse.id}
                ref={(el) => {
                  sectionRefs.current[i] = el;
                }}
                id={`verse-${verse.id}`}
                className="flex flex-col items-center gap-2.5 scroll-mt-24"
              >
                <span className="text-xs tabular-nums text-white mb-7">
                  {verse.id}
                </span>

                <p
                  className="font-arabic text-center text-[1.75rem] leading-[2.8] font-medium text-foreground sm:text-3xl"
                  dir="rtl"
                  lang="ar"
                >
                  {verse.text}
                </p>

                <p className="max-w-md text-center text-base leading-7 text-white font-normal">
                  {verse.translation}
                </p>
              </article>
            ))}
            <div
              className="pointer-events-none"
              style={{ height: BOTTOM_EDGE_SPACER }}
              aria-hidden
            />
          </div>
        </div>
      </main>

      {/* Bottom dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-56">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(4,12,8,0.8) 0%, rgba(4,12,8,0.56) 38%, rgba(4,12,8,0.18) 72%, rgba(4,12,8,0) 100%)",
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            WebkitMaskImage:
              "linear-gradient(to top, black 26%, rgba(0,0,0,0.96) 52%, rgba(0,0,0,0.45) 78%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 26%, rgba(0,0,0,0.96) 52%, rgba(0,0,0,0.45) 78%, transparent 100%)",
          }}
          aria-hidden
        />

        <div
          className="absolute inset-x-0 bottom-10 z-30 flex justify-center"
          style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
        >
          <div className="pointer-events-auto">
            <SyncOrb />
          </div>
        </div>
      </div>
    </div>
  );
}
