import { Link } from "react-router-dom";
import { Disc3, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { getAssetUrl, useMusic } from "@/components/music/MusicProvider";

export default function FloatingMusicPlayer() {
  const { currentTrack, isPlaying, progress, duration, error, playPause, next, previous, seek } = useMusic();
  const percent = duration ? (progress / duration) * 100 : 0;

  return (
    <aside className={`floating-player ${isPlaying ? "is-playing" : ""}`} aria-label="全站音乐播放器">
      <Link to="/music" className="player-cover" aria-label="进入音乐空间">
        {currentTrack ? <img src={getAssetUrl(currentTrack.coverPath)} alt={currentTrack.album} /> : <Disc3 size={24} />}
      </Link>
      <div className="player-meta">
        <span>{currentTrack?.title ?? "静默水面"}</span>
        <small>{error ?? currentTrack?.artist ?? "等待播放列表"}</small>
        <input
          aria-label="播放进度"
          type="range"
          min={0}
          max={duration || 1}
          value={progress}
          onChange={(event) => seek(Number(event.target.value))}
          style={{ backgroundSize: `${percent}% 100%` }}
        />
      </div>
      <div className="player-actions">
        <button type="button" onClick={previous} aria-label="上一首"><SkipBack size={15} /></button>
        <button type="button" onClick={playPause} aria-label={isPlaying ? "暂停" : "播放"}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
        <button type="button" onClick={next} aria-label="下一首"><SkipForward size={15} /></button>
      </div>
      <div className="player-wave" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </aside>
  );
}
