// app/components/SyncOrb.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SyncOrb() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Fixed-size frame keeps orb + label center stable during animations */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        <div style={{ filter: "drop-shadow(0 18px 45px rgba(0,0,0,0.55))" }}>
          <motion.button
            className="relative flex h-28 w-28 items-center justify-center"
            onClick={() => setIsActive(!isActive)}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            aria-label={isActive ? "Stop syncing" : "Start syncing"}
          >
            {/* Outer glow */}
            <motion.div
              className="absolute rounded-full"
              animate={{
                width: isActive ? 128 : 86,
                height: isActive ? 128 : 86,
                opacity: isActive ? 0.28 : 0,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{
                background:
                  "radial-gradient(circle, rgba(106,168,96,0.55) 0%, rgba(106,168,96,0) 70%)",
              }}
            />

            {/* Pulse ring: always mounted for smoother state transitions */}
            <motion.div
              className="absolute rounded-full border border-white/14"
              animate={
                isActive
                  ? {
                      scale: [1, 1.42, 1],
                      opacity: [0.62, 0.08, 0.62],
                    }
                  : {
                      scale: 1,
                      opacity: 0,
                    }
              }
              transition={
                isActive
                  ? {
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 0.22, ease: "easeOut" }
              }
              style={{ width: 76, height: 76 }}
            />

            {/* Orb */}
            <motion.div
              className="relative overflow-hidden rounded-full"
              animate={{
                width: isActive ? 72 : 64,
                height: isActive ? 72 : 64,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #a8d4a0 0%, #5a8a54 40%, #2d5a27 100%)",
                }}
              />

              <div
                className="absolute inset-[-20%] animate-[orb-spin_8s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, rgba(168,212,160,0.6) 25%, transparent 50%, rgba(90,138,84,0.4) 75%, transparent 100%)",
                }}
              />

              <div
                className="absolute inset-[-10%] animate-[orb-spin_6s_linear_infinite_reverse]"
                style={{
                  background:
                    "conic-gradient(from 180deg, transparent 0%, rgba(122,158,115,0.5) 20%, transparent 40%, rgba(61,107,53,0.3) 70%, transparent 100%)",
                }}
              />

              <div
                className="absolute inset-0 animate-[orb-drift_4s_ease-in-out_infinite]"
                style={{
                  background:
                    "radial-gradient(circle at 60% 30%, rgba(200,230,195,0.7) 0%, transparent 50%)",
                }}
              />

              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 52%, rgba(0,0,0,0.12) 100%)",
                }}
              />

              {/* subtle highlight ring + depth */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 -4px 12px rgba(0,0,0,0.22), inset 0 2px 8px rgba(255,255,255,0.12)",
                }}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Fixed label height prevents vertical jitter when text changes */}
      <div className="flex h-5 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={isActive ? "listening" : "sync"}
            className="text-[13px] tracking-[0.22em] text-white uppercase select-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {isActive ? "Listening" : "Sync"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
