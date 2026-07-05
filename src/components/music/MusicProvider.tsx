import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type RawTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  filePath: string;
  coverPath: string;
  genre?: string;
  releaseYear?: number;
  source?: "local" | "netease" | "backend";
  musicId?: string;
};

type Playlist = {
  playlistName: string;
  songs: RawTrack[];
};

type MusicConfig = {
  backendBaseUrl?: string;
  netease?: {
    enabled?: boolean;
    apiBase?: string;
    musicIds?: string[];
  };
};

type MusicContextValue = {
  tracks: RawTrack[];
  currentTrack: RawTrack | null;
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  playPause: () => void;
  next: () => void;
  previous: () => void;
  selectTrack: (index: number) => void;
  seek: (value: number) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function assetUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `/${path.replace(/^\/+/, "")}`;
}

function neteaseUrl(id: string, apiBase = "https://music.163.com/song/media/outer/url") {
  return `${apiBase}?id=${encodeURIComponent(id)}.mp3`;
}

async function loadNeteaseTracks(config: MusicConfig) {
  const ids = config.netease?.musicIds ?? [];
  if (!config.netease?.enabled || ids.length === 0) return [];

  const backendBase = config.backendBaseUrl?.replace(/\/$/, "");
  const tracks = await Promise.all(ids.map(async (id): Promise<RawTrack> => {
    if (backendBase) {
      try {
        const response = await fetch(`${backendBase}/api/music/netease/${encodeURIComponent(id)}`);
        if (response.ok) {
          const data = await response.json();
          return {
            id: `netease-${id}`,
            musicId: id,
            title: data.title ?? `Netease #${id}`,
            artist: data.artist ?? "Netease Cloud Music",
            album: data.album ?? data.title ?? `Netease #${id}`,
            filePath: data.url ?? neteaseUrl(id, config.netease?.apiBase),
            coverPath: data.cover ?? "assets/musicbox/cover/Elegant.jpg",
            genre: "Netease",
            source: "backend",
          };
        }
      } catch {
        // 后端不可用时降级到网易云外链。
      }
    }

    return {
      id: `netease-${id}`,
      musicId: id,
      title: `Netease #${id}`,
      artist: "Netease Cloud Music",
      album: `MusicID ${id}`,
      filePath: neteaseUrl(id, config.netease?.apiBase),
      coverPath: "assets/musicbox/cover/Elegant.jpg",
      genre: "Netease",
      source: "netease",
    };
  }));

  return tracks;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<RawTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/assets/musicbox/cover/playlist.json").then((response) => response.json()).catch(() => ({ songs: [] } as Playlist)),
      fetch("/config/music.json").then((response) => response.json()).catch(() => ({} as MusicConfig)),
    ])
      .then(async ([playlist, config]: [Playlist, MusicConfig]) => {
        const localSongs = (playlist.songs ?? [])
          .filter((track) => track.artist.toLowerCase() !== "zc")
          .map((track) => ({ ...track, source: "local" as const }));
        const neteaseTracks = await loadNeteaseTracks(config);
        const nextTracks = [...localSongs, ...neteaseTracks];
        setTracks(nextTracks);
        const elegantIndex = nextTracks.findIndex((track) => track.title.toLowerCase() === "elegant");
        setCurrentIndex(elegantIndex >= 0 ? elegantIndex : 0);
      })
      .catch(() => setError("播放列表暂时无法抵达，音乐空间仍保持静默。"));
  }, []);

  const currentTrack = tracks[currentIndex] ?? null;

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = assetUrl(currentTrack.filePath);
    audioRef.current.load();
    setProgress(0);
    setDuration(0);
    setError(null);
    if (isPlaying) {
      audioRef.current.play().catch(() => setError(`无法播放 ${currentTrack.title}，可能文件尚未迁入或外链受限。`));
    }
  }, [currentTrack?.id]);

  const next = useCallback(() => {
    setCurrentIndex((index) => (tracks.length ? (index + 1) % tracks.length : 0));
  }, [tracks.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) => (tracks.length ? (index - 1 + tracks.length) % tracks.length : 0));
  }, [tracks.length]);

  const playPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setError(`无法播放 ${currentTrack.title}，已保留控制权。`);
    });
  }, [currentTrack, isPlaying]);

  const selectTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const seek = useCallback((value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setProgress(value);
  }, []);

  const value = useMemo(() => ({
    tracks,
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    duration,
    error,
    playPause,
    next,
    previous,
    selectTrack,
    seek,
  }), [tracks, currentTrack, currentIndex, isPlaying, progress, duration, error, playPause, next, previous, selectTrack, seek]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={next}
        onError={() => {
          setIsPlaying(false);
          if (currentTrack) setError(`无法播放 ${currentTrack.title}，可能文件不存在或外链受限。`);
        }}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}

export function getAssetUrl(path: string) {
  return assetUrl(path);
}
