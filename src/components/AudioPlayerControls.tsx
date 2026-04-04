import { useQuranStore, RECITERS, type RepeatMode } from "@/store/quranStore";
import {
  Play,
  Pause,
  Square,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
} from "lucide-react";

const AudioPlayerControls = () => {
  const {
    isPlaying,
    isPaused,
    currentAyah,
    seek,
    duration,
    repeatMode,
    reciter,
    currentSurah,
    ayahs,
    surahs,
    playAyah,
    pause,
    resume,
    stop,
    seekTo,
    setRepeatMode,
    setReciter,
  } = useQuranStore();

  const currentSurahName = surahs.find((s) => s.number === currentSurah)?.englishName || "";
  const maxAyah = ayahs.length > 0 ? ayahs[ayahs.length - 1].numberInSurah : 0;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else if (isPaused) resume();
    else if (currentAyah > 0) playAyah(currentAyah);
    else playAyah(1);
  };

  const handlePrev = () => { if (currentAyah > 1) playAyah(currentAyah - 1); };
  const handleNext = () => { if (currentAyah < maxAyah) playAyah(currentAyah + 1); };

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ["none", "single", "range"];
    const idx = modes.indexOf(repeatMode);
    setRepeatMode(modes[(idx + 1) % modes.length]);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const active = isPlaying || isPaused;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/98 backdrop-blur-xl border-t border-border shadow-lg">
        {/* Progress */}
        {active && duration > 0 && (
          <div className="px-4 pt-3">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={seek}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{formatTime(seek)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Now playing */}
        {currentAyah > 0 && (
          <p className="text-center text-xs text-muted-foreground px-4 py-1">
            {currentSurahName} · Ayah {currentAyah}
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 pb-2 pt-1">
          <button onClick={cycleRepeat}
            className={`p-2 rounded-full transition-colors ${repeatMode !== "none" ? "text-primary" : "text-muted-foreground"}`}>
            {repeatMode === "single" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>

          <button onClick={handlePrev} disabled={currentAyah <= 1}
            className="p-2 rounded-full text-foreground hover:bg-muted transition-colors disabled:opacity-30">
            <SkipBack className="w-4 h-4" />
          </button>

          <button onClick={handlePlayPause}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button onClick={handleNext} disabled={currentAyah >= maxAyah}
            className="p-2 rounded-full text-foreground hover:bg-muted transition-colors disabled:opacity-30">
            <SkipForward className="w-4 h-4" />
          </button>

          <button onClick={stop}
            className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors">
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Reciter */}
        <div className="px-4 pb-3">
          <select
            value={reciter.id}
            onChange={(e) => {
              const r = RECITERS.find((r) => r.id === e.target.value);
              if (r) setReciter(r);
            }}
            className="w-full text-xs py-2 px-3 rounded-lg bg-muted border border-border text-foreground focus:outline-none"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerControls;
