"use client";

import Link from "next/link";
import { useState } from "react";

type SurahSummary = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
};

type SurahListProps = {
  surahs: SurahSummary[];
};

export default function SurahList({ surahs }: SurahListProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? surahs.filter(
        (s) =>
          s.transliteration.toLowerCase().includes(query.toLowerCase()) ||
          s.translation.toLowerCase().includes(query.toLowerCase()) ||
          String(s.id).includes(query.trim()),
      )
    : surahs;

  return (
    <div className="relative min-h-svh font-sans">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/green-wide.jpg)" }}
        aria-hidden
      />
      <div className="fixed inset-0 bg-(--background)/50" aria-hidden />

      <main className="relative flex min-h-svh flex-col items-center px-6 pt-16 pb-24">
        <header className="mb-10 text-center">
          <h1 className="text-xl font-semibold tracking-widest text-white uppercase">
            Taraweeh
          </h1>
          <p className="mt-2 text-sm text-white/50">Select a surah to begin</p>
        </header>

        <input
          type="search"
          placeholder="Search by name or number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-6 w-full max-w-md rounded-full border border-white/20 bg-white/10
                     px-5 py-2.5 text-sm text-white placeholder:text-white/40
                     focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur"
        />

        <ol className="w-full max-w-md space-y-0.5">
          {filtered.map((surah) => (
            <li key={surah.id}>
              <Link
                href={`/${surah.id}`}
                className="flex items-center justify-between rounded-xl px-4 py-3
                           text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-7 shrink-0 text-right text-xs tabular-nums text-white/40">
                    {surah.id}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-snug">
                      {surah.transliteration}
                    </p>
                    <p className="text-xs text-white/50">{surah.translation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-white/35">
                    {surah.total_verses}v
                  </span>
                  <p
                    className="font-arabic text-base leading-none text-white/80"
                    dir="rtl"
                    lang="ar"
                  >
                    {surah.name}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
