import { create } from "zustand";
import type { Surah, Ayah } from "@/services/quranApiService";
import {
  fetchSurahList,
  fetchSurah,
  getAudioUrl,
} from "@/services/quranApiService";
import { audioEngine } from "@/services/audioEngine";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  saveLastRead,
  getLastRead,
  type Bookmark,
  type LastReadPosition,
} from "@/services/firebaseService";

export type RepeatMode = "none" | "single" | "range";

export interface Reciter {
  id: string;
  name: string;
  baseUrl: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    baseUrl: "https://everyayah.com/data/Alafasy_128kbps/",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    baseUrl: "https://everyayah.com/data/Husary_128kbps/",
  },
  {
    id: "minshawi_murattal",
    name: "Mohamed Siddiq El-Minshawi",
    baseUrl: "https://everyayah.com/data/Minshawy_Murattal_128kbps/",
  },
  {
    id: "abdulbasit_murattal",
    name: "Abdul Basit (Murattal)",
    baseUrl: "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/",
  },
  {
    id: "sudais",
    name: "Abdur-Rahman as-Sudais",
    baseUrl: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/",
  },
];

interface QuranState {
  // Data
  surahs: Surah[];
  currentSurah: number;
  ayahs: Ayah[];
  loading: boolean;

  // Player
  isPlaying: boolean;
  isPaused: boolean;
  currentAyah: number;
  seek: number;
  duration: number;

  // Selection
  selectionStart: number | null;
  selectionEnd: number | null;

  // Repeat
  repeatMode: RepeatMode;

  // Reciter
  reciter: Reciter;

  // Bookmarks
  bookmarks: Bookmark[];

  // Last read
  lastRead: LastReadPosition | null;

  // Actions
  loadSurahs: () => Promise<void>;
  loadSurah: (surahNumber: number) => Promise<void>;
  playAyah: (ayahNumber: number) => void;
  playRange: (start: number, end: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (position: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setReciter: (reciter: Reciter) => void;
  setSelection: (start: number | null, end: number | null) => void;
  toggleBookmark: (surah: number, ayah: number, surahName: string) => void;
  loadBookmarks: () => Promise<void>;
  loadLastRead: () => Promise<void>;
  updateLastRead: (surah: number, ayah: number, surahName: string) => void;
}

export const useQuranStore = create<QuranState>((set, get) => {
  // Setup audio engine callbacks
  audioEngine.setCallbacks({
    onAyahStart: (surah, ayah) => {
      set({ currentAyah: ayah, isPlaying: true, isPaused: false });
    },
    onAyahEnd: (_surah, ayah) => {
      const state = get();
      const { repeatMode, selectionStart, selectionEnd, ayahs, reciter, currentSurah } = state;

      if (repeatMode === "single") {
        // Replay same ayah
        const url = getAudioUrl(currentSurah, ayah, reciter.baseUrl);
        const nextAyah = ayah;
        const nextUrl = getAudioUrl(currentSurah, nextAyah, reciter.baseUrl);
        audioEngine.play(url, currentSurah, ayah, nextUrl);
        return;
      }

      if (repeatMode === "range" && selectionStart !== null && selectionEnd !== null) {
        if (ayah >= selectionEnd) {
          // Loop back to start of range
          const url = getAudioUrl(currentSurah, selectionStart, reciter.baseUrl);
          const nextUrl = selectionStart < selectionEnd
            ? getAudioUrl(currentSurah, selectionStart + 1, reciter.baseUrl)
            : undefined;
          audioEngine.play(url, currentSurah, selectionStart, nextUrl);
          return;
        }
      }

      // Play next ayah
      const maxAyah = ayahs.length > 0 ? ayahs[ayahs.length - 1].numberInSurah : 0;
      const nextAyah = ayah + 1;

      if (repeatMode === "range" && selectionEnd !== null && nextAyah > selectionEnd) {
        if (selectionStart !== null) {
          const url = getAudioUrl(currentSurah, selectionStart, reciter.baseUrl);
          audioEngine.play(url, currentSurah, selectionStart);
        }
        return;
      }

      if (nextAyah <= maxAyah) {
        const url = getAudioUrl(currentSurah, nextAyah, reciter.baseUrl);
        const nextNextUrl = nextAyah + 1 <= maxAyah
          ? getAudioUrl(currentSurah, nextAyah + 1, reciter.baseUrl)
          : undefined;
        audioEngine.play(url, currentSurah, nextAyah, nextNextUrl);
      } else {
        set({ isPlaying: false, isPaused: false, currentAyah: 0 });
      }
    },
    onProgress: (seek, duration) => {
      set({ seek, duration });
    },
  });

  return {
    surahs: [],
    currentSurah: 1,
    ayahs: [],
    loading: false,
    isPlaying: false,
    isPaused: false,
    currentAyah: 0,
    seek: 0,
    duration: 0,
    selectionStart: null,
    selectionEnd: null,
    repeatMode: "none",
    reciter: RECITERS[0],
    bookmarks: [],
    lastRead: null,

    loadSurahs: async () => {
      const surahs = await fetchSurahList();
      set({ surahs });
    },

    loadSurah: async (surahNumber: number) => {
      set({ loading: true, currentSurah: surahNumber, currentAyah: 0, selectionStart: null, selectionEnd: null });
      const ayahs = await fetchSurah(surahNumber);
      set({ ayahs, loading: false });
    },

    playAyah: (ayahNumber: number) => {
      const { currentSurah, reciter, ayahs } = get();
      const url = getAudioUrl(currentSurah, ayahNumber, reciter.baseUrl);
      const maxAyah = ayahs[ayahs.length - 1]?.numberInSurah || 0;
      const nextUrl = ayahNumber + 1 <= maxAyah
        ? getAudioUrl(currentSurah, ayahNumber + 1, reciter.baseUrl)
        : undefined;
      audioEngine.play(url, currentSurah, ayahNumber, nextUrl);
      set({ currentAyah: ayahNumber, isPlaying: true, isPaused: false });
    },

    playRange: (start: number, end: number) => {
      set({ selectionStart: start, selectionEnd: end, repeatMode: "range" });
      get().playAyah(start);
    },

    pause: () => {
      audioEngine.pause();
      set({ isPaused: true, isPlaying: false });
    },

    resume: () => {
      audioEngine.resume();
      set({ isPaused: false, isPlaying: true });
    },

    stop: () => {
      audioEngine.stop();
      set({ isPlaying: false, isPaused: false, currentAyah: 0, seek: 0, duration: 0 });
    },

    seekTo: (position: number) => {
      audioEngine.seek(position);
    },

    setRepeatMode: (mode: RepeatMode) => set({ repeatMode: mode }),

    setReciter: (reciter: Reciter) => {
      audioEngine.stop();
      set({ reciter, isPlaying: false, isPaused: false, currentAyah: 0 });
    },

    setSelection: (start, end) => set({ selectionStart: start, selectionEnd: end }),

    toggleBookmark: async (surah, ayah, surahName) => {
      const { bookmarks } = get();
      const exists = bookmarks.some((b) => b.surah === surah && b.ayah === ayah);
      if (exists) {
        await removeBookmark(surah, ayah);
        set({ bookmarks: bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah)) });
      } else {
        const bm: Bookmark = { surah, ayah, surahName, createdAt: Date.now() };
        await addBookmark(bm);
        set({ bookmarks: [...bookmarks, bm] });
      }
    },

    loadBookmarks: async () => {
      try {
        const bookmarks = await getBookmarks();
        set({ bookmarks });
      } catch (e) {
        console.error("Failed to load bookmarks:", e);
      }
    },

    loadLastRead: async () => {
      try {
        const lastRead = await getLastRead();
        set({ lastRead });
      } catch (e) {
        console.error("Failed to load last read:", e);
      }
    },

    updateLastRead: async (surah, ayah, surahName) => {
      const pos: LastReadPosition = { surah, ayah, surahName, updatedAt: Date.now() };
      set({ lastRead: pos });
      try {
        await saveLastRead(pos);
      } catch (e) {
        console.error("Failed to save last read:", e);
      }
    },
  };
});
