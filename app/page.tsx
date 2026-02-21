import SyncOrb from "./components/SyncOrb";

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
    <div className="relative min-h-svh font-sans">
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/green-wide.jpg)" }}
        aria-hidden
      />

      {/* Overall readability overlay */}
      <div className="fixed inset-0 bg-(--background)/50" aria-hidden />

      {/* Content */}
      <main className="relative flex min-h-svh items-start justify-center">
        <div
          className="flex w-full max-w-2xl flex-col items-center px-6 pt-24 sm:pt-32 mb-4"
          // Give enough space so the last verse never lives under the control
          style={{
            paddingBottom: "calc(234px + env(safe-area-inset-bottom))",
            // Hard clip: verse content fully disappears before entering orb area.
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 260px), rgba(0,0,0,0.85) calc(100% - 230px), transparent calc(100% - 170px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black calc(100% - 260px), rgba(0,0,0,0.85) calc(100% - 230px), transparent calc(100% - 170px), transparent 100%)",
          }}
        >
          <header className="mb-16 text-center">
            <h1
              className="font-arabic text-6xl font-bold leading-relaxed text-foreground"
              dir="rtl"
            >
              الفاتحة
            </h1>
            <p className="mt-1 text-lg tracking-widest text-white uppercase">
              The Opener
            </p>
          </header>

          <div className="flex w-full flex-col gap-14">
            {verses.map((verse) => (
              <article
                key={verse.id}
                className="flex flex-col items-center gap-5"
              >
                <span className="text-xs tabular-nums text-white">
                  {verse.id}
                </span>

                <p
                  className="font-arabic text-center text-[1.75rem] leading-[2.8] font-normal text-foreground sm:text-3xl"
                  dir="rtl"
                  lang="ar"
                >
                  {verse.text}
                </p>

                <p className="max-w-md text-center text-base leading-7 text-white">
                  {verse.translation}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom dock that text scrolls behind, with blur/clip fade */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-56">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(4,12,8,0.8) 0%, rgba(4,12,8,0.56) 38%, rgba(4,12,8,0.18) 72%, rgba(4,12,8,0) 100%)",
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            WebkitMaskImage:
              "linear-gradient(to top, black 26%, rgba(0,0,0,0.96) 52%, rgba(0,0,0,0.45) 78%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 26%, rgba(0,0,0,0.96) 52%, rgba(0,0,0,0.45) 78%, transparent 100%)",
          }}
          aria-hidden
        />

        <div
          className="absolute inset-x-0 bottom-10 z-30 flex justify-center"
          style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
        >
          <div className="pointer-events-auto">
            <SyncOrb />
          </div>
        </div>
      </div>
    </div>
  );
}
