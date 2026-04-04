import { useEffect } from "react";
import { useQuranStore } from "@/store/quranStore";
import AyahItem from "./AyahItem";
import { ArrowLeft, Loader2 } from "lucide-react";

interface QuranPageProps {
  onBack: () => void;
}

const QuranPage = ({ onBack }: QuranPageProps) => {
  const {
    ayahs,
    loading,
    currentSurah,
    currentAyah,
    surahs,
    bookmarks,
    selectionStart,
    selectionEnd,
    loadSurah,
  } = useQuranStore();

  const surahInfo = surahs.find((s) => s.number === currentSurah);
  const surahName = surahInfo?.englishName || "";

  useEffect(() => {
    loadSurah(currentSurah);
  }, [currentSurah]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const showBismillah = currentSurah !== 1 && currentSurah !== 9;

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-foreground">{surahName}</p>
            <p className="font-quran text-accent text-lg">{surahInfo?.name}</p>
          </div>
          <div className="w-9" /> {/* spacer */}
        </div>
      </div>

      {/* Surah decoration */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center py-6">
          <div className="inline-block px-8 py-3 rounded-xl bg-surah-header border border-primary/30">
            <p className="font-quran text-2xl text-accent">{surahInfo?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {surahInfo?.englishNameTranslation} · {surahInfo?.numberOfAyahs} Ayahs ·{" "}
              {surahInfo?.revelationType}
            </p>
          </div>
        </div>

        {/* Bismillah */}
        {showBismillah && (
          <p className="font-quran text-2xl text-bismillah text-center mb-6" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* Ayahs */}
        <div className="space-y-1">
          {ayahs.map((ayah) => {
            const isPlaying = currentAyah === ayah.numberInSurah;
            const isSelected =
              selectionStart !== null &&
              selectionEnd !== null &&
              ayah.numberInSurah >= selectionStart &&
              ayah.numberInSurah <= selectionEnd;
            const isBm = bookmarks.some(
              (b) => b.surah === currentSurah && b.ayah === ayah.numberInSurah
            );

            return (
              <AyahItem
                key={ayah.number}
                ayah={ayah}
                isPlaying={isPlaying}
                isSelected={isSelected}
                isBookmarked={isBm}
                surahName={surahName}
              />
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between py-8 px-2">
          {currentSurah > 1 && (
            <button
              onClick={() => loadSurah(currentSurah - 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              ← Previous Surah
            </button>
          )}
          <div className="flex-1" />
          {currentSurah < 114 && (
            <button
              onClick={() => loadSurah(currentSurah + 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              Next Surah →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuranPage;
