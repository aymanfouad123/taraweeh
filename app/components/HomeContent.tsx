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

const observerOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: "-30% 0px -20% 0px",
  threshold: [0, 0.25, 0.5, 0.75, 1],
};

export default function HomeContent({
  verses,
  surahNumber,
  surahTransliteration,
}: HomeContentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const refs = sectionRefs.current;
    const visible = new Map<number, number>();

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const index = refs.indexOf(entry.target as HTMLElement);
        if (index === -1) continue;
        visible.set(index, entry.intersectionRatio);
      }
      if (visible.size === 0) return;
      let best = 0;
      let bestRatio = 0;
      visible.forEach((ratio, idx) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = idx;
        }
      });
      setActiveIndex(best);
    }, observerOptions);

    refs.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [verses.length]);

  const scrollToVerse = (index: number) => {
    const el = sectionRefs.current[index];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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
