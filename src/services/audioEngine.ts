import { Howl } from "howler";

export interface AudioEngineCallbacks {
  onAyahStart?: (surah: number, ayah: number) => void;
  onAyahEnd?: (surah: number, ayah: number) => void;
  onPlaybackEnd?: () => void;
  onProgress?: (seek: number, duration: number) => void;
}

class AudioEngine {
  private currentHowl: Howl | null = null;
  private preloadedHowl: Howl | null = null;
  private preloadedKey: string = "";
  private callbacks: AudioEngineCallbacks = {};
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private _isPlaying = false;

  setCallbacks(cb: AudioEngineCallbacks) {
    this.callbacks = cb;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  play(url: string, surah: number, ayah: number, nextUrl?: string) {
    this.stop();

    const key = `${surah}_${ayah}`;
    let howl: Howl;

    if (this.preloadedKey === key && this.preloadedHowl) {
      howl = this.preloadedHowl;
      this.preloadedHowl = null;
      this.preloadedKey = "";
    } else {
      howl = new Howl({ src: [url], html5: true, preload: true });
    }

    this.currentHowl = howl;
    this._isPlaying = true;

    howl.on("play", () => {
      this.callbacks.onAyahStart?.(surah, ayah);
      this.startProgress();
    });

    howl.on("end", () => {
      this.stopProgress();
      this._isPlaying = false;
      this.callbacks.onAyahEnd?.(surah, ayah);
    });

    howl.play();

    // Preload next
    if (nextUrl) {
      const nextKey = `${surah}_${ayah + 1}`;
      if (this.preloadedKey !== nextKey) {
        this.preloadedHowl?.unload();
        this.preloadedHowl = new Howl({
          src: [nextUrl],
          html5: true,
          preload: true,
        });
        this.preloadedKey = nextKey;
      }
    }
  }

  pause() {
    this.currentHowl?.pause();
    this._isPlaying = false;
    this.stopProgress();
  }

  resume() {
    this.currentHowl?.play();
    this._isPlaying = true;
    this.startProgress();
  }

  stop() {
    this.currentHowl?.stop();
    this.currentHowl?.unload();
    this.currentHowl = null;
    this._isPlaying = false;
    this.stopProgress();
  }

  seek(position: number) {
    this.currentHowl?.seek(position);
  }

  getDuration(): number {
    return this.currentHowl?.duration() || 0;
  }

  getSeek(): number {
    const s = this.currentHowl?.seek();
    return typeof s === "number" ? s : 0;
  }

  private startProgress() {
    this.stopProgress();
    this.progressInterval = setInterval(() => {
      if (this.currentHowl && this._isPlaying) {
        this.callbacks.onProgress?.(this.getSeek(), this.getDuration());
      }
    }, 200);
  }

  private stopProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  destroy() {
    this.stop();
    this.preloadedHowl?.unload();
    this.preloadedHowl = null;
  }
}

export const audioEngine = new AudioEngine();
