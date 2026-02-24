"use client";

import { motion } from "framer-motion";

export type SidebarNavProps = {
  activeIndex: number;
  totalItems: number;
  onItemClick: (index: number) => void;
  surahTransliteration: string;
};

const OPACITY_BY_DISTANCE: Record<number, number> = {
  0: 1.0,
  1: 0.82,
  2: 0.64,
  3: 0.46,
  4: 0.3,
  5: 0.16,
  6: 0.06,
};

const WINDOW_HALF = 6;
const TOTAL_SLOTS = 2 * WINDOW_HALF + 1;

export default function SidebarNav({
  activeIndex,
  totalItems,
  onItemClick,
  surahTransliteration,
}: SidebarNavProps) {
  return (
    <motion.nav
      aria-label="Verse navigation"
      className="fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 sm:flex flex-col items-start"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Surah heading — always visible, not windowed */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="block h-px bg-white"
          style={{ width: 24 }}
          aria-hidden
        />
        <p className="text-[12px] font-semibold tracking-wide text-white/80 select-none leading-none">
          {/* {surahNumber}.  */}
          {surahTransliteration}
        </p>
      </div>

      {/* Windowed verse rows — only in-bounds slots rendered */}
      <ul className="flex flex-col gap-[5px] pl-1 overflow-hidden" role="list">
        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
          const offset = slotIdx - WINDOW_HALF;
          const verseIndex = activeIndex + offset;
          const inBounds = verseIndex >= 0 && verseIndex < totalItems;
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          const opacity = inBounds ? (OPACITY_BY_DISTANCE[distance] ?? 0) : 0;

          return (
            <motion.li
              key={offset}
              animate={{
                height: inBounds ? "auto" : 0,
                marginBottom: inBounds ? 0 : -5,
              }}
              transition={{ duration: 0.18 }}
              style={{ overflow: "hidden" }}
            >
              <motion.button
                type="button"
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                onClick={() => inBounds && onItemClick(verseIndex)}
                animate={{ opacity }}
                transition={{ duration: 0.18 }}
                whileHover={inBounds ? { opacity: 0.9 } : undefined}
                aria-current={isActive ? "true" : undefined}
                aria-label={
                  inBounds ? `Go to verse ${verseIndex + 1}` : undefined
                }
              >
                {/* Dash indicator */}
                <motion.span
                  className="block h-px bg-white origin-left"
                  animate={{
                    width: isActive ? 14 : 5,
                    opacity: isActive ? 1 : 0.3,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  aria-hidden
                />

                {/* Verse number */}
                <motion.span
                  className="tabular-nums font-medium leading-none"
                  animate={{
                    color: isActive
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.4)",
                    fontSize: isActive ? "12px" : "11px",
                  }}
                  transition={{ duration: 0.18 }}
                >
                  {inBounds ? verseIndex + 1 : "\u00A0"}
                </motion.span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
