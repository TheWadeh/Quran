import { useState } from "react";
import SurahList from "@/components/SurahList";
import QuranPage from "@/components/QuranPage";
import AudioPlayerControls from "@/components/AudioPlayerControls";
import { useQuranStore } from "@/store/quranStore";

const Index = () => {
  const [view, setView] = useState<"list" | "reader">("list");
  const { loadSurah } = useQuranStore();

  const handleSelectSurah = (surahNumber: number) => {
    loadSurah(surahNumber);
    setView("reader");
  };

  return (
    <div className="min-h-screen bg-background">
      {view === "list" ? (
        <SurahList onSelectSurah={handleSelectSurah} />
      ) : (
        <QuranPage onBack={() => setView("list")} />
      )}
      <AudioPlayerControls />
    </div>
  );
};

export default Index;
