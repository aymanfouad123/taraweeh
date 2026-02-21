"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SyncOrb() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        className="relative flex items-center justify-center"
        onClick={() => setIsActive(!isActive)}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        aria-label={isActive ? "Stop syncing" : "Start syncing"}
      >
        {/* Outer glow — expands when active */}
        <motion.div
          className="absolute rounded-full"
          animate={{
            width: isActive ? 120 : 80,
            height: isActive ? 120 : 80,
            opacity: isActive ? 0.3 : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{
            background:
              "radial-gradient(circle, rgba(106,168,96,0.5) 0%, rgba(106,168,96,0) 70%)",
          }}
        />

        {/* Pulsing ring — visible when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute rounded-full border border-white/15"
              initial={{ width: 72, height: 72, opacity: 0 }}
              animate={{
                width: [72, 100, 72],
                height: [72, 100, 72],
                opacity: [0.4, 0, 0.4],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Main orb */}
        <motion.div
          className="relative overflow-hidden rounded-full"
          animate={{
            width: isActive ? 72 : 64,
            height: isActive ? 72 : 64,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Base gradient layer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #a8d4a0 0%, #5a8a54 40%, #2d5a27 100%)",
            }}
          />

          {/* Rotating gradient blob 1 */}
          <div
            className="absolute inset-[-20%] animate-[orb-spin_8s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(168,212,160,0.6) 25%, transparent 50%, rgba(90,138,84,0.4) 75%, transparent 100%)",
            }}
          />

          {/* Rotating gradient blob 2 — counter-direction */}
          <div
            className="absolute inset-[-10%] animate-[orb-spin_6s_linear_infinite_reverse]"
            style={{
              background:
                "conic-gradient(from 180deg, transparent 0%, rgba(122,158,115,0.5) 20%, transparent 40%, rgba(61,107,53,0.3) 70%, transparent 100%)",
            }}
          />

          {/* Drifting radial highlight */}
          <div
            className="absolute inset-0 animate-[orb-drift_4s_ease-in-out_infinite]"
            style={{
              background:
                "radial-gradient(circle at 60% 30%, rgba(200,230,195,0.7) 0%, transparent 50%)",
            }}
          />

          {/* Glass sheen */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Inner shadow for depth */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "inset 0 -4px 12px rgba(0,0,0,0.2), inset 0 2px 8px rgba(255,255,255,0.15)",
            }}
          />
        </motion.div>
      </motion.button>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isActive ? "listening" : "sync"}
          className="text-xs tracking-widest text-white/60 uppercase select-none"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {isActive ? "Listening" : "Sync"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
