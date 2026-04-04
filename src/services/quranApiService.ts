const API_BASE = "https://api.alquran.cloud/v1";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: { number: number; name: string };
  juz: number;
  page: number;
}

// Cache keys
const SURAH_LIST_KEY = "quran_surah_list";
const SURAH_DATA_PREFIX = "quran_surah_";

export const fetchSurahList = async (): Promise<Surah[]> => {
  // Check cache
  const cached = localStorage.getItem(SURAH_LIST_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  const res = await fetch(`${API_BASE}/surah`);
  const data = await res.json();
  const surahs = data.data as Surah[];

  // Cache
  localStorage.setItem(SURAH_LIST_KEY, JSON.stringify(surahs));
  return surahs;
};

export const fetchSurah = async (surahNumber: number): Promise<Ayah[]> => {
  const cacheKey = `${SURAH_DATA_PREFIX}${surahNumber}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  // Use quran-uthmani edition for Uthmani script
  const res = await fetch(`${API_BASE}/surah/${surahNumber}/quran-uthmani`);
  const data = await res.json();
  const ayahs = data.data.ayahs as Ayah[];

  localStorage.setItem(cacheKey, JSON.stringify(ayahs));
  return ayahs;
};

export const getAudioUrl = (
  surahNumber: number,
  ayahNumber: number,
  reciterBaseUrl: string
): string => {
  const surahStr = String(surahNumber).padStart(3, "0");
  const ayahStr = String(ayahNumber).padStart(3, "0");
  return `${reciterBaseUrl}${surahStr}${ayahStr}.mp3`;
};
