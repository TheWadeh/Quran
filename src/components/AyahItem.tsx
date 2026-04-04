import { useRef, useCallback } from "react";
import { useQuranStore } from "@/store/quranStore";
import type { Ayah } from "@/services/quranApiService";
import { Bookmark, Play } from "lucide-react";

interface AyahItemProps {
  ayah: Ayah;
  isPlaying: boolean;
  isSelected: boolean;
  isBookmarked: boolean;
  surahName: string;
}

const AyahItem = ({ ayah, isPlaying, isSelected, isBookmarked, surahName }: AyahItemProps) => {
  const { playAyah, toggleBookmark, updateLastRead } = useQuranStore();
  const ref = useRef<HTMLDivElement>(null);

  // Auto-scroll when playing
  if (isPlaying && ref.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const handlePlay = useCallback(() => {
    playAyah(ayah.numberInSurah);
    updateLastRead(ayah.surah.number, ayah.numberInSurah, surahName);
  }, [ayah, surahName]);

  const handleBookmark = useCallback(() => {
    toggleBookmark(ayah.surah.number, ayah.numberInSurah, surahName);
  }, [ayah, surahName]);

  return (
    <div
      ref={ref}
      className={`relative p-4 rounded-xl mb-3 ayah-transition ${
        isPlaying
          ? "ayah-highlight border border-primary/30"
          : isSelected
          ? "bg-secondary/50 border border-border"
          : "border border-transparent"
      }`}
    >
      {/* Ayah text */}
      <p
        className="font-quran text-2xl md:text-3xl leading-[2.5] text-right text-foreground"
        dir="rtl"
      >
        {ayah.text}
        <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm text-ayah-number font-sans align-middle">
          ﴿{ayah.numberInSurah}﴾
        </span>
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Ayah {ayah.numberInSurah}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked
                  ? "text-accent fill-accent"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            onClick={handlePlay}
            className={`p-1.5 rounded-md transition-colors ${
              isPlaying
                ? "bg-primary text-primary-foreground pulse-gold"
                : "hover:bg-secondary text-muted-foreground"
            }`}
            title="Play"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AyahItem;
