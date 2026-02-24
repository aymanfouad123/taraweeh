// app/components/SyncOrb.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WINDOW_MS = 12_000;
const HOP_MS = 10_000;
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

type SyncSession = {
  last_idx: number;
  state: string;
  state_entered_at: string;
  miss_streak: number;
  pending_idx: number | null;
  pending_hits: number;
};

export type OrbMatchPayload = {
  surah?: number | string;
  ayah?: number;
  ar?: string;
  index?: number;
  confidence?: number;
};

type SyncOrbProps = {
  onMatch?: (payload: OrbMatchPayload) => void;
};

const INITIAL_SESSION: SyncSession = {
  last_idx: -1,
  state: "active",
  state_entered_at: new Date().toISOString(),
  miss_streak: 0,
  pending_idx: null,
  pending_hits: 0,
};

type QueueChunk = {
  blob: Blob;
  chunkId: number;
};

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function reasonLabel(reason: string | null): string {
  if (!reason) return "Listening";
  switch (reason) {
    case "silence":
      return "Silence";
    case "low_confidence":
      return "Low confidence";
    case "pending_confirmation":
      return "Pending confirmation";
    case "lock_hold":
      return "Locked";
    default:
      return reason.replaceAll("_", " ");
  }
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return (
    MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
  );
}

export default function SyncOrb({ onMatch }: SyncOrbProps) {
  const [isActive, setIsActive] = useState(false);
  const [statusText, setStatusText] = useState("Sync");
  const [healthReady, setHealthReady] = useState<boolean | null>(null);
  const [lastMatch, setLastMatch] = useState<OrbMatchPayload | null>(null);

  const sessionRef = useRef<SyncSession>(INITIAL_SESSION);
  const queueRef = useRef<QueueChunk[]>([]);
  const isUploadingRef = useRef(false);
  const isRunningRef = useRef(false);

  const streamRef = useRef<MediaStream | null>(null);
  const chunkIntervalRef = useRef<number | null>(null);
  const nextChunkIdRef = useRef(0);
  const recorderMapRef = useRef<Map<number, MediaRecorder>>(new Map());
  const mimeTypeRef = useRef("");
  const uploadAbortRef = useRef<AbortController | null>(null);

  const stopCapture = useCallback(() => {
    isRunningRef.current = false;
    setIsActive(false);
    setStatusText("Sync");

    if (chunkIntervalRef.current !== null) {
      window.clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    for (const recorder of recorderMapRef.current.values()) {
      if (recorder.state !== "inactive") recorder.stop();
    }
    recorderMapRef.current.clear();

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  const overwriteSessionFromPayload = useCallback((payload: unknown) => {
    if (!payload || typeof payload !== "object") return;
    const asRecord = payload as Record<string, unknown>;
    const previous = sessionRef.current;
    const rawPendingIdx = asRecord.pending_idx;
    let pendingIdx = previous.pending_idx;

    if (rawPendingIdx === null || rawPendingIdx === "") {
      pendingIdx = null;
    } else if (
      typeof rawPendingIdx === "number" &&
      Number.isFinite(rawPendingIdx)
    ) {
      pendingIdx = rawPendingIdx;
    } else if (typeof rawPendingIdx === "string") {
      const parsedPending = Number(rawPendingIdx);
      if (Number.isFinite(parsedPending)) pendingIdx = parsedPending;
    }

    sessionRef.current = {
      last_idx: toNumber(asRecord.last_idx, previous.last_idx),
      state: toString(asRecord.state, previous.state),
      state_entered_at: toString(
        asRecord.state_entered_at,
        previous.state_entered_at,
      ),
      miss_streak: toNumber(asRecord.miss_streak, previous.miss_streak),
      pending_idx: pendingIdx,
      pending_hits: toNumber(asRecord.pending_hits, previous.pending_hits),
    };
  }, []);

  const uploadQueue = useCallback(async () => {
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;

    try {
      while (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        if (!next) continue;

        const form = new FormData();
        const fileName = `chunk-${next.chunkId}.webm`;
        form.append("audio", next.blob, fileName);

        const currentSession = sessionRef.current;
        form.append("last_idx", String(currentSession.last_idx));
        form.append("state", currentSession.state);
        form.append("state_entered_at", currentSession.state_entered_at);
        form.append("miss_streak", String(currentSession.miss_streak));
        form.append(
          "pending_idx",
          currentSession.pending_idx === null
            ? ""
            : String(currentSession.pending_idx),
        );
        form.append("pending_hits", String(currentSession.pending_hits));

        uploadAbortRef.current = new AbortController();
        const response = await fetch("/sync", {
          method: "POST",
          body: form,
          signal: uploadAbortRef.current.signal,
        });
        uploadAbortRef.current = null;

        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          setStatusText("Sync error");
          continue;
        }

        overwriteSessionFromPayload(payload);

        if (!payload || typeof payload !== "object") continue;
        const asRecord = payload as Record<string, unknown>;

        if (asRecord.match === true) {
          const nextMatch: OrbMatchPayload = {
            surah: asRecord.surah as number | string | undefined,
            ayah: toNumber(asRecord.ayah, NaN),
            ar: asRecord.ar as string | undefined,
            index: toNumber(asRecord.index, NaN),
            confidence: toNumber(asRecord.confidence, NaN),
          };

          if (Number.isNaN(nextMatch.ayah ?? NaN)) delete nextMatch.ayah;
          if (Number.isNaN(nextMatch.index ?? NaN)) delete nextMatch.index;
          if (Number.isNaN(nextMatch.confidence ?? NaN))
            delete nextMatch.confidence;

          setLastMatch(nextMatch);
          setStatusText("Listening");
          onMatch?.(nextMatch);
          continue;
        }

        const reason =
          typeof asRecord.reason === "string" ? asRecord.reason : null;
        setStatusText(reasonLabel(reason));
      }
    } catch {
      setStatusText("Sync error");
    } finally {
      uploadAbortRef.current = null;
      isUploadingRef.current = false;
      if (queueRef.current.length > 0) void uploadQueue();
    }
  }, [onMatch, overwriteSessionFromPayload]);

  const enqueueChunk = useCallback(
    (blob: Blob, chunkId: number) => {
      queueRef.current.push({ blob, chunkId });
      void uploadQueue();
    },
    [uploadQueue],
  );

  const startChunkRecorder = useCallback(
    (chunkId: number) => {
      if (!streamRef.current) return;

      const options = mimeTypeRef.current
        ? { mimeType: mimeTypeRef.current }
        : undefined;
      const recorder = new MediaRecorder(streamRef.current, options);
      const parts: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) parts.push(event.data);
      };

      recorder.onstop = () => {
        recorderMapRef.current.delete(chunkId);
        if (parts.length === 0) return;
        const blob = new Blob(parts, {
          type: recorder.mimeType || mimeTypeRef.current || "audio/webm",
        });
        enqueueChunk(blob, chunkId);
      };

      recorder.onerror = () => {
        setStatusText("Mic error");
      };

      recorderMapRef.current.set(chunkId, recorder);
      recorder.start();

      window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, WINDOW_MS);
    },
    [enqueueChunk],
  );

  const startCapture = useCallback(async () => {
    if (isRunningRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mimeTypeRef.current = pickMimeType();
      isRunningRef.current = true;
      setIsActive(true);
      setStatusText("Listening");

      nextChunkIdRef.current = 0;
      startChunkRecorder(nextChunkIdRef.current);
      nextChunkIdRef.current += 1;

      chunkIntervalRef.current = window.setInterval(() => {
        if (!isRunningRef.current) return;
        startChunkRecorder(nextChunkIdRef.current);
        nextChunkIdRef.current += 1;
      }, HOP_MS);
    } catch {
      stopCapture();
      setStatusText("Mic blocked");
    }
  }, [startChunkRecorder, stopCapture]);

  useEffect(() => {
    let cancelled = false;

    const runHealthCheck = async () => {
      try {
        const response = await fetch("/health", { method: "GET" });
        if (!cancelled) setHealthReady(response.ok);
      } catch {
        if (!cancelled) setHealthReady(false);
      }
    };

    void runHealthCheck();
    return () => {
      cancelled = true;
      stopCapture();
      uploadAbortRef.current?.abort();
    };
  }, [stopCapture]);

  const toggleCapture = () => {
    if (isActive) {
      stopCapture();
      return;
    }
    void startCapture();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Fixed-size frame keeps orb + label center stable during animations */}
      <div className="relative flex w-36 items-center justify-center">
        <div style={{ filter: "drop-shadow(0 18px 45px rgba(0,0,0,0.55))" }}>
          <motion.button
            className="relative flex h-28 w-28 items-center justify-center"
            onClick={toggleCapture}
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
      <div className="flex h-0 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={isActive ? statusText : "sync"}
            className="text-[11px] tracking-[0.22em] text-white uppercase select-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {isActive ? statusText : "Sync"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col items-center justify-start gap-1 text-[10px] leading-none text-white/70">
        {/* <span>{healthReady === false ? "Sync backend offline" : " "}</span> */}
        <span>
          {lastMatch?.surah !== undefined && lastMatch?.ayah !== undefined
            ? `Surah ${String(lastMatch.surah)} • Ayah ${String(lastMatch.ayah)}`
            : " "}
        </span>
      </div>
    </div>
  );
}
