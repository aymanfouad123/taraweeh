import rawData from "@/data/quran_en.json";

export type Verse = {
  id: number;
  text: string;
  translation: string;
};

export type Surah = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
  verses: Verse[];
};

export const quranData: Surah[] = rawData as Surah[];

/**
 * Returns a surah by its 1-indexed ID (1–114), or null if out of range.
 * Centralises the id-1 offset so callers never need to think about it.
 */
export function getSurahById(id: number): Surah | null {
  if (id < 1 || id > 114) return null;
  return quranData[id - 1] ?? null;
}
