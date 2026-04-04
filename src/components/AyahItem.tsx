import { useCallback } from "react";
import { useQuranStore } from "@/store/quranStore";
import type { Ayah } from "@/services/quranApiService";
import { Bookmark, Play } from "lucide-react";

interface AyahItemProps {
  ayah: Ayah;
  isPlaying: boolean;
  isSelected: boolean;
  isBookmarked: boolean;
  surahName: string;
  surahNumber: number;
}

const AyahItem = ({ ayah, isPlaying, isSelected, isBookmarked, surahName, surahNumber }: AyahItemProps) => {
  const { playAyah, toggleBookmark, updateLastRead } = useQuranStore();

  const handlePlay = useCallback(() => {
    playAyah(ayah.numberInSurah);
    updateLastRead(surahNumber, ayah.numberInSurah, surahName);
  }, [ayah.numberInSurah, surahNumber, surahName]);

  const handleBookmark = useCallback(() => {
    toggleBookmark(surahNumber, ayah.numberInSurah, surahName);
  }, [surahNumber, ayah.numberInSurah, surahName]);

  return (
    <div
      data-ayah={ayah.numberInSurah}
      className={`relative p-4 rounded-xl mb-2 ayah-transition ${
        isPlaying
          ? "ayah-highlight border border-primary/30"
          : isSelected
          ? "bg-muted/50 border border-border"
          : "border border-transparent hover:bg-muted/30"
      }`}
    >
      <p
        className="font-quran text-2xl md:text-3xl leading-[2.5] text-right text-foreground"
        dir="rtl"
      >
        {ayah.text}
        <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm text-ayah-number font-sans align-middle">
          ﴿{ayah.numberInSurah}﴾
        </span>
      </p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <span className="text-xs text-muted-foreground">
          Ayah {ayah.numberInSurah}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isBookmarked ? "text-primary fill-primary" : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            onClick={handlePlay}
            className={`p-1.5 rounded-md transition-colors ${
              isPlaying
                ? "bg-primary text-primary-foreground pulse-gold"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AyahItem;
