import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSurahById } from "@/app/lib/quran";
import HomeContent from "@/app/components/HomeContent";

type PageProps = {
  params: Promise<{ surah: string }>;
  searchParams: Promise<{ verse?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surah: surahParam } = await params;
  const surah = getSurahById(Number(surahParam));
  if (!surah) return { title: "Taraweeh" };
  return {
    title: `${surah.transliteration} — Taraweeh`,
    description: `Read Surah ${surah.transliteration} (${surah.translation})`,
  };
}

export default async function SurahPage({ params, searchParams }: PageProps) {
  const { surah: surahParam } = await params;
  const { verse: verseParam } = await searchParams;

  const surah = getSurahById(Number(surahParam));
  if (!surah) notFound();

  // verse param is 1-indexed (matches verse.id); convert to 0-indexed for HomeContent
  const rawVerse = Number(verseParam ?? "1");
  const initialVerseIndex = Number.isFinite(rawVerse)
    ? Math.max(0, Math.min(rawVerse - 1, surah.total_verses - 1))
    : 0;

  return (
    <HomeContent
      verses={surah.verses}
      surahTransliteration={surah.transliteration}
      surahId={surah.id}
      initialVerseIndex={initialVerseIndex}
    />
  );
}
