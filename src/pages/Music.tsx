import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import PageFrame from "@/components/PageFrame";
import { getAssetUrl, useMusic } from "@/components/music/MusicProvider";

export default function Music() {
  const { tracks, currentIndex, currentTrack, isPlaying, error, playPause, next, previous, selectTrack } = useMusic();

  return (
    <PageFrame eyebrow="Music Room" title="水室里的播放队列">
      <section className="music-room">
        <div className={`album-orbit ${isPlaying ? "is-playing" : ""}`}>
          {currentTrack && <img src={getAssetUrl(currentTrack.coverPath)} alt={currentTrack.album} />}
        </div>
        <div className="music-panel">
          <p className="eyebrow">Now Playing</p>
          <h2>{currentTrack?.title ?? "静默"}</h2>
          <p>{error ?? currentTrack?.artist ?? "等待播放列表"}</p>
          <div className="large-controls">
            <button type="button" onClick={previous}><SkipBack size={18} /></button>
            <button type="button" onClick={playPause}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
            <button type="button" onClick={next}><SkipForward size={18} /></button>
          </div>
        </div>
      </section>
      <div className="track-list">
        {tracks.map((track, index) => (
          <button type="button" className={index === currentIndex ? "active" : ""} onClick={() => selectTrack(index)} key={track.id}>
            <span>{track.title}</span>
            <small>{track.artist} / {track.genre ?? "Unknown"}</small>
          </button>
        ))}
      </div>
    </PageFrame>
  );
}
