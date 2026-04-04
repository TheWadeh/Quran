import { useEffect, useRef, useState } from "react";
import { useQuranStore } from "@/store/quranStore";
import AyahItem from "./AyahItem";
import { ArrowLeft, Loader2, BookOpen, List } from "lucide-react";

interface QuranPageProps {
  onBack: () => void;
}

type ViewMode = "ayah" | "page";

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
    playAyah,
    updateLastRead,
    toggleBookmark,
  } = useQuranStore();

  const [viewMode, setViewMode] = useState<ViewMode>("ayah");
  const pageRef = useRef<HTMLDivElement>(null);

  const surahInfo = surahs.find((s) => s.number === currentSurah);
  const surahName = surahInfo?.englishName || "";

  useEffect(() => {
    loadSurah(currentSurah);
  }, [currentSurah]);

  // Auto-scroll to playing ayah
  useEffect(() => {
    if (currentAyah > 0) {
      const el = document.querySelector(`[data-ayah="${currentAyah}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentAyah]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const showBismillah = currentSurah !== 1 && currentSurah !== 9;

  return (
    <div className="min-h-screen pb-44 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium text-foreground">{surahName}</p>
            <p className="font-quran text-primary text-lg">{surahInfo?.name}</p>
          </div>
          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === "ayah" ? "page" : "ayah")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={viewMode === "ayah" ? "Page view" : "Ayah view"}
          >
            {viewMode === "ayah" ? (
              <BookOpen className="w-5 h-5 text-foreground" />
            ) : (
              <List className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4" ref={pageRef}>
        {/* Surah header */}
        <div className="text-center py-6">
          <div className="inline-block px-8 py-4 rounded-2xl bg-card border border-border shadow-sm">
            <p className="font-quran text-3xl text-primary">{surahInfo?.name}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {surahInfo?.englishNameTranslation} · {surahInfo?.numberOfAyahs} Ayahs ·{" "}
              {surahInfo?.revelationType}
            </p>
          </div>
        </div>

        {/* Bismillah */}
        {showBismillah && (
          <p className="font-quran text-2xl text-primary text-center mb-6" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* Content based on view mode */}
        {viewMode === "ayah" ? (
          <div className="space-y-1">
            {ayahs.map((ayah) => (
              <AyahItem
                key={ayah.number}
                ayah={ayah}
                isPlaying={currentAyah === ayah.numberInSurah}
                isSelected={
                  selectionStart !== null &&
                  selectionEnd !== null &&
                  ayah.numberInSurah >= selectionStart &&
                  ayah.numberInSurah <= selectionEnd
                }
                isBookmarked={bookmarks.some(
                  (b) => b.surah === currentSurah && b.ayah === ayah.numberInSurah
                )}
                surahName={surahName}
                surahNumber={currentSurah}
              />
            ))}
          </div>
        ) : (
          /* Full page / Mushaf view */
          <div className="mushaf-page text-2xl md:text-3xl py-4 px-2 bg-card rounded-2xl border border-border shadow-sm p-6">
            {ayahs.map((ayah) => {
              const isActive = currentAyah === ayah.numberInSurah;
              const isBm = bookmarks.some(
                (b) => b.surah === currentSurah && b.ayah === ayah.numberInSurah
              );
              return (
                <span
                  key={ayah.number}
                  data-ayah={ayah.numberInSurah}
                  className={`ayah-inline ${isActive ? "active" : ""}`}
                  onClick={() => {
                    playAyah(ayah.numberInSurah);
                    updateLastRead(currentSurah, ayah.numberInSurah, surahName);
                  }}
                >
                  {ayah.text}
                  <span className="text-ayah-number text-base mx-1 font-sans">
                    ﴿{ayah.numberInSurah}﴾
                  </span>
                  {isBm && (
                    <span className="text-primary text-base">★</span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Surah navigation */}
        <div className="flex justify-between py-8 px-2">
          {currentSurah > 1 ? (
            <button
              onClick={() => loadSurah(currentSurah - 1)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm hover:bg-muted transition-colors"
            >
              ← Previous Surah
            </button>
          ) : <div />}
          {currentSurah < 114 ? (
            <button
              onClick={() => loadSurah(currentSurah + 1)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm hover:bg-muted transition-colors"
            >
              Next Surah →
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};

export default QuranPage;
