import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause, X, Radio } from "lucide-react";

export function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("schrodinger-abyss-bgm-muted") === "true";
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.35;
    const storedVol = window.localStorage.getItem("schrodinger-abyss-bgm-vol");
    return storedVol !== null ? Math.max(0, Math.min(1, parseFloat(storedVol))) : 0.35;
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const startPlayback = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setNeedsInteraction(false);
      } catch {
        setIsPlaying(false);
        setNeedsInteraction(true);
      }
    };

    void startPlayback();

    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused && !isMuted) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setNeedsInteraction(false);
          })
          .catch(() => {});
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      cleanupListeners();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [isMuted, volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    const effectiveVol = isMuted ? 0 : volume;
    audioRef.current.volume = effectiveVol;

    if (typeof window !== "undefined") {
      window.localStorage.setItem("schrodinger-abyss-bgm-vol", String(volume));
      window.localStorage.setItem("schrodinger-abyss-bgm-muted", String(isMuted));
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch((err) => {
          console.warn("BGM playback error:", err);
        });
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && !isPlaying && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch(() => {});
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(event.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const displayVolumePercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className="luto-audio-widget">
      {/* Expanded Control Modal */}
      {isExpanded ? (
        <div className="luto-audio-panel">
          <div className="luto-audio-header">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Radio size={13} color="#f4f5f8" />
              <span className="luto-audio-title">AMBIENT RESONANCE</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="luto-audio-close"
              title="Close Panel"
            >
              <X size={13} />
            </button>
          </div>

          <div className="luto-audio-status-row">
            <span style={{ color: "#8b929e" }}>FREQUENCY:</span>
            <span style={{ color: isPlaying && !isMuted ? "#f4f5f8" : "#d97706", fontWeight: 500 }}>
              {isPlaying && !isMuted ? "TRANSMITTING" : isMuted ? "MUTED" : "PAUSED"}
            </span>
          </div>

          {/* Equalizer animation */}
          <div className="luto-audio-eq-track">
            {[45, 80, 35, 75, 40, 90, 30, 65, 85, 40, 70, 55].map((height, i) => (
              <div
                key={i}
                className="luto-eq-bar"
                style={{
                  height: isPlaying && !isMuted ? `${height}%` : "15%",
                  opacity: isPlaying && !isMuted ? 0.85 : 0.25,
                }}
              />
            ))}
          </div>

          {/* Volume Slider */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#8b929e", marginBottom: "4px", letterSpacing: "0.1em" }}>
              <span>GAIN</span>
              <span style={{ fontFamily: "monospace" }}>{displayVolumePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Audio volume"
              className="luto-audio-slider"
            />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={togglePlay}
              className="title-menu-btn"
              style={{ flex: 1, padding: "8px 12px", justifyContent: "center", gap: "6px" }}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="title-menu-btn"
              style={{ flex: 1, padding: "8px 12px", justifyContent: "center", gap: "6px" }}
            >
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              <span>{isMuted ? "UNMUTE" : "MUTE"}</span>
            </button>
          </div>

          {needsInteraction && !isPlaying && (
            <p style={{ marginTop: "8px", fontSize: "9.5px", color: "#d97706", textAlign: "center", letterSpacing: "0.08em" }}>
              [ CLICK ANYWHERE TO START AUDIO ]
            </p>
          )}
        </div>
      ) : (
        /* Sleek Minimalist Audio Pill */
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {needsInteraction && (
            <span style={{ fontSize: "9.5px", color: "#d97706", letterSpacing: "0.1em", background: "rgba(14, 16, 22, 0.9)", border: "1px solid rgba(217, 119, 6, 0.3)", padding: "4px 8px", borderRadius: "4px", backdropFilter: "blur(12px)" }}>
              CLICK FOR SOUND
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="luto-audio-pill-btn"
            title="Audio Controls"
          >
            <span className="luto-mini-eq">
              <span className={`luto-mini-bar ${isPlaying && !isMuted ? "h3" : "h1"}`} />
              <span className={`luto-mini-bar ${isPlaying && !isMuted ? "h2" : "h1"}`} />
              <span className={`luto-mini-bar ${isPlaying && !isMuted ? "h35" : "h1"}`} />
            </span>
            <span>
              {isMuted ? "MUTED" : isPlaying ? `AUDIO ${displayVolumePercent}%` : "PAUSED"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
