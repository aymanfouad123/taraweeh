import quranData from "@/data/quran_en.json";
import HomeContent from "./components/HomeContent";

const surah = quranData[2]; // Ali 'Imran (0-indexed: 0=Al-Fatihah, 1=Al-Baqarah, 2=Ali 'Imran)

export default function Home() {
  return (
    <HomeContent
      verses={surah.verses}
      surahTransliteration={surah.transliteration}
    />
  );
}
