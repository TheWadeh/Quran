import { useEffect, useRef, useState, useCallback } from "react";
import { useQuranStore } from "@/store/quranStore";
import AyahItem from "./AyahItem";
import { ArrowLeft, Loader2, BookOpen, List, ChevronLeft, ChevronRight } from "lucide-react";

interface QuranPageProps {
  onBack: () => void;
}

type ViewMode = "ayah" | "page";

const PAGE_SIZE = 10;

const playPageFlip = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

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

  const [viewMode, setViewMode] = useState<ViewMode>("page");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const pageRef = useRef<HTMLDivElement>(null);

  const surahInfo = surahs.find((s) => s.number === currentSurah);
  const surahName = surahInfo?.englishName || "";
  const totalPages = Math.ceil(ayahs.length / PAGE_SIZE);

  useEffect(() => {
    loadSurah(currentSurah);
  }, [currentSurah]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentSurah]);

  useEffect(() => {
    if (currentAyah > 0) {
      const page = Math.ceil(currentAyah / PAGE_SIZE);
      if (page !== currentPage && page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [currentAyah]);

  useEffect(() => {
    if (currentAyah > 0) {
      const el = document.querySelector(`[data-ayah="${currentAyah}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentAyah]);

  const handlePageFlip = useCallback((direction: "next" | "prev") => {
    if (direction === "next" && currentPage >= totalPages) return;
    if (direction === "prev" && currentPage <= 1) return;
    
    setFlipDirection(direction);
    setIsFlipping(true);
    playPageFlip();
    
    setTimeout(() => {
      setCurrentPage((prev) => direction === "next" ? prev + 1 : prev - 1);
      setIsFlipping(false);
    }, 300);
  }, [currentPage, totalPages]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (viewMode !== "page") return;
    if (e.key === "ArrowRight" || e.key === "PageUp") {
      handlePageFlip("prev");
    } else if (e.key === "ArrowLeft" || e.key === "PageDown" || e.key === " ") {
      handlePageFlip("next");
    }
  }, [viewMode, handlePageFlip]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const showBismillah = currentSurah !== 1 && currentSurah !== 9;
  const startAyah = (currentPage - 1) * PAGE_SIZE + 1;
  const endAyah = Math.min(currentPage * PAGE_SIZE, ayahs.length);
  const pageAyahs = ayahs.filter(a => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah);

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
        {/* Content based on view mode */}
        {viewMode === "ayah" ? (
          <>
            <div className="text-center py-6">
              <div className="inline-block px-8 py-4 rounded-2xl bg-card border border-border shadow-sm">
                <p className="font-quran text-3xl text-primary">{surahInfo?.name}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {surahInfo?.englishNameTranslation} · {surahInfo?.numberOfAyahs} Ayahs ·{" "}
                  {surahInfo?.revelationType}
                </p>
              </div>
            </div>
            {showBismillah && (
              <p className="font-quran text-2xl text-primary text-center mb-6" dir="rtl">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            )}
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
          </>
        ) : (
          <div 
            className={`mushaf-page text-2xl md:text-3xl py-8 px-6 md:px-12 transition-transform duration-300 ${
              isFlipping ? (flipDirection === "next" ? "translate-x-full opacity-0" : "-translate-x-full opacity-0") : ""
            }`}
          >
            {/* Page header */}
            <div className="flex justify-between items-center mb-6 border-b-2 border-primary/20 pb-3">
              <span className="text-primary/70 text-sm font-medium">{surahInfo?.number}</span>
              <span className="font-quran text-xl text-primary">{surahInfo?.name}</span>
              <span className="text-primary/70 text-sm font-medium">{surahInfo?.numberOfAyahs}</span>
            </div>

            {/* Bismillah for first page of certain surahs */}
            {currentPage === 1 && showBismillah && (
              <p className="text-center mb-8 text-xl text-primary">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
            )}

            {/* Page content */}
            <div className="leading-loose">
              {pageAyahs.map((ayah) => {
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
                      <span className="text-primary text-base ml-1">★</span>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Page footer */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t-2 border-primary/20">
              <button 
                onClick={() => handlePageFlip("prev")}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 text-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">{currentPage > 1 ? currentPage - 1 : ''}</span>
              </button>
              <div className="text-center">
                <span className="text-primary/70 text-sm block">{currentPage} / {totalPages}</span>
                <span className="text-ayah-number text-lg">﴾{endAyah}﴿</span>
              </div>
              <button 
                onClick={() => handlePageFlip("next")}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 text-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm">{currentPage < totalPages ? currentPage + 1 : ''}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons for ayah view */}
        {viewMode === "ayah" && (
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
        )}
      </div>
    </div>
  );
};

export default QuranPage;
