import { useEffect, useState } from "react";
import { useQuranStore } from "@/store/quranStore";
import type { Surah } from "@/services/quranApiService";
import { Star, Clock, Sun, Moon } from "lucide-react";

interface SurahListProps {
  onSelectSurah: (surahNumber: number) => void;
}

const SurahList = ({ onSelectSurah }: SurahListProps) => {
  const { surahs, loadSurahs, bookmarks, lastRead, loadBookmarks, loadLastRead } =
    useQuranStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"surahs" | "bookmarks">("surahs");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadSurahs();
    loadBookmarks();
    loadLastRead();
    // Check initial theme
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="text-center py-8 px-4 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
        </button>
        <h1 className="font-quran text-4xl text-primary mb-1">القرآن الكريم</h1>
        <p className="text-muted-foreground text-sm">The Holy Quran</p>
      </div>

      {/* Last Read */}
      {lastRead && (
        <button
          onClick={() => onSelectSurah(lastRead.surah)}
          className="mx-4 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 hover:bg-primary/15 transition-colors"
        >
          <Clock className="w-4 h-4 text-primary" />
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Continue Reading</p>
            <p className="text-sm text-foreground">
              {lastRead.surahName} - Ayah {lastRead.ayah}
            </p>
          </div>
        </button>
      )}

      {/* Tabs */}
      <div className="flex mx-4 mb-4 bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab("surahs")}
          className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${
            tab === "surahs"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Surahs ({surahs.length})
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${
            tab === "bookmarks"
              ? "bg-background text-foreground shadow-sm"
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
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
          />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === "surahs" ? (
          <div className="space-y-1">
            {filtered.map((surah) => (
              <SurahRow key={surah.number} surah={surah} onClick={() => onSelectSurah(surah.number)} />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="space-y-1">
            {bookmarks.map((bm) => (
              <button
                key={`${bm.surah}_${bm.ayah}`}
                onClick={() => onSelectSurah(bm.surah)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <Star className="w-4 h-4 text-primary fill-primary" />
                <div className="text-left">
                  <p className="text-sm text-foreground">{bm.surahName}</p>
                  <p className="text-xs text-muted-foreground">Ayah {bm.ayah}</p>
                </div>
              </button>
            ))}
          </div>
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
    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
  >
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm text-primary font-semibold">
      {surah.number}
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-medium text-foreground">{surah.englishName}</p>
      <p className="text-xs text-muted-foreground">
        {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs
      </p>
    </div>
    <p className="font-quran text-xl text-primary/80 group-hover:text-primary transition-colors">
      {surah.name}
    </p>
  </button>
);

export default SurahList;
