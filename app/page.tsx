const verses = [
  {
    id: 1,
    text: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful",
  },
  {
    id: 2,
    text: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
    translation: "[All] praise is [due] to Allah, Lord of the worlds",
  },
  {
    id: 3,
    text: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful",
  },
  {
    id: 4,
    text: "مَٰلِكِ يَوۡمِ ٱلدِّينِ",
    translation: "Sovereign of the Day of Recompense",
  },
  {
    id: 5,
    text: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ",
    translation: "It is You we worship and You we ask for help",
  },
  {
    id: 6,
    text: "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ",
    translation: "Guide us to the straight path",
  },
  {
    id: 7,
    text: "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ",
    translation:
      "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh items-start justify-center font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center px-6 py-24 sm:py-32">
        {/* Surah header */}
        <header className="mb-16 text-center">
          <h1
            className="font-arabic text-3xl font-bold leading-relaxed text-foreground"
            dir="rtl"
          >
            الفاتحة
          </h1>
          <p className="mt-1 text-sm tracking-widest text-muted uppercase">
            The Opener
          </p>
        </header>

        {/* Verses */}
        <div className="flex w-full flex-col gap-14">
          {verses.map((verse) => (
            <article key={verse.id} className="flex flex-col items-center gap-5">
              <span className="text-xs tabular-nums text-muted">
                {verse.id}
              </span>

              <p
                className="font-arabic text-center text-[1.75rem] leading-[2.8] font-normal text-foreground sm:text-3xl"
                dir="rtl"
                lang="ar"
              >
                {verse.text}
              </p>

              <p className="max-w-md text-center text-base leading-7 text-secondary">
                {verse.translation}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
