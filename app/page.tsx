import quranData from "@/data/quran_en.json";
import HomeContent from "./components/HomeContent";

const surah = quranData[2]; // Al-Fatihah

export default function Home() {
  return (
    <HomeContent
      verses={surah.verses}
      surahNumber={surah.id}
      surahTransliteration={surah.transliteration}
    />
  );
}
