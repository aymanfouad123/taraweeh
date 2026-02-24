import type { Metadata } from "next";
import { quranData } from "@/app/lib/quran";
import SurahList from "./components/SurahList";

export const metadata: Metadata = {
  title: "Taraweeh",
  description: "Follow along with the Taraweeh prayer",
};

export default function HomePage() {
  // Strip verses before serialising to the client — avoids sending ~2.4 MB of
  // verse text through the RSC payload for a page that only needs surah names.
  const surahs = quranData.map(
    ({ id, name, transliteration, translation, type, total_verses }) => ({
      id,
      name,
      transliteration,
      translation,
      type,
      total_verses,
    }),
  );

  return <SurahList surahs={surahs} />;
}
