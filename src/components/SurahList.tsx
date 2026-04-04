import { useEffect, useState } from "react";
import { useQuranStore } from "@/store/quranStore";
import type { Surah } from "@/services/quranApiService";
import { BookOpen, Star, Clock } from "lucide-react";

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
}

const SurahList = ({ onSelectSurah }: SurahListProps) => {
  const { surahs, loadSurahs, bookmarks, lastRead, loadBookmarks, loadLastRead } =
    useQuranStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"surahs" | "bookmarks">("surahs");

  useEffect(() => {
    loadSurahs();
    loadBookmarks();
    loadLastRead();
  }, []);

  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="font-quran text-4xl text-accent mb-2">القرآن الكريم</h1>
        <p className="text-muted-foreground text-sm">The Holy Quran</p>
      </div>

      {/* Last Read */}
      {lastRead && (
        <button
          onClick={() => onSelectSurah(lastRead.surah)}
          className="mx-4 mb-4 p-3 rounded-lg bg-primary/20 border border-primary/30 flex items-center gap-3 hover:bg-primary/30 transition-colors"
        >
          <Clock className="w-4 h-4 text-accent" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Continue Reading</p>
            <p className="text-sm text-foreground">
              {lastRead.surahName} - Ayah {lastRead.ayah}
            </p>
          </div>
        </button>
      )}

      {/* Tabs */}
      <div className="flex mx-4 mb-4 bg-secondary rounded-lg p-1">
        <button
          onClick={() => setTab("surahs")}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            tab === "surahs"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          Surahs
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            tab === "bookmarks"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Search */}
      {tab === "surahs" && (
        <div className="px-4 mb-4">
          <input
            type="text"
            placeholder="Search surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {tab === "surahs" ? (
          filtered.map((surah) => (
            <SurahRow key={surah.number} surah={surah} onClick={() => onSelectSurah(surah.number)} />
          ))
        ) : bookmarks.length > 0 ? (
          bookmarks.map((bm) => (
            <button
              key={`${bm.surah}_${bm.ayah}`}
              onClick={() => onSelectSurah(bm.surah)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <Star className="w-4 h-4 text-accent fill-accent" />
              <div className="text-left">
                <p className="text-sm text-foreground">{bm.surahName}</p>
                <p className="text-xs text-muted-foreground">Ayah {bm.ayah}</p>
              </div>
            </button>
          ))
        ) : (
          <p className="text-center text-muted-foreground text-sm py-8">
            No bookmarks yet
          </p>
        )}
      </div>
    </div>
  );
};

const SurahRow = ({ surah, onClick }: { surah: Surah; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
  >
    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-sm text-accent font-medium">
      {surah.number}
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm text-foreground">{surah.englishName}</p>
      <p className="text-xs text-muted-foreground">
        {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs
      </p>
    </div>
    <p className="font-quran text-lg text-accent opacity-80 group-hover:opacity-100 transition-opacity">
      {surah.name}
    </p>
  </button>
);

export default SurahList;
