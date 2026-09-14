"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic, Disc3 } from "lucide-react";
import { triggerSmartAudioPause, triggerSmartAudioResume } from "@/lib/smart-audio-sync";

interface Track {
  id: number;
  title: string;
  series: string;
  durationStr: string;
  durationSec: number;
  date: string;
  tag: string;
  description: string;
  audioSrc: string;
}

const DEMO_TRACKS: Track[] = [
  {
    id: 1,
    title: "Les Réseaux de l'Ombre : Usines à clics et cyberguerre",
    series: "Les Voix du Réel • Saison 2",
    durationStr: "03:45",
    durationSec: 225,
    date: "Enquête Exclusive",
    tag: "Investigation Numérique",
    description:
      "Extrait sonore exclusif : Infiltration au cœur d'une centrale de fermes à bots et témoignages sous anonymat.",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Secrets d'État : Les dossiers confidentiels de l'énergie",
    series: "Enquêtes Média • Hors-série",
    durationStr: "04:12",
    durationSec: 252,
    date: "Grand Reportage",
    tag: "Politique & Souveraineté",
    description:
      "Révélations sur les arbitrages géopolitiques des filières énergétiques européennes.",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
];

export default function AudioPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DEMO_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        triggerSmartAudioPause(`Extraits Sonores (${currentTrack.title})`);
        audioRef.current.play().catch(() => {
          // Si le navigateur bloque l'autoplay audio externe
          setIsPlaying(false);
          triggerSmartAudioResume(`Extraits Sonores (${currentTrack.title})`);
        });
      } else {
        audioRef.current.pause();
        triggerSmartAudioResume(`Extraits Sonores (${currentTrack.title})`);
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || currentTrack.durationSec;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current) {
      const duration = audioRef.current.duration || currentTrack.durationSec;
      audioRef.current.currentTime = (value / 100) * duration;
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const formatCurrentTime = () => {
    if (!audioRef.current) return "00:00";
    const sec = Math.floor(audioRef.current.currentTime);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <audio
        ref={audioRef}
        src={currentTrack.audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />

      {/* Track Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-neutral-800">
        {DEMO_TRACKS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => selectTrack(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
              currentTrackIndex === idx
                ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20"
                : "bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
            }`}
          >
            <Disc3
              className={`w-3.5 h-3.5 ${
                currentTrackIndex === idx && isPlaying ? "animate-spin" : ""
              }`}
            />
            <span>Extrait {idx + 1} : {t.tag}</span>
          </button>
        ))}
      </div>

      {/* Main Track Display */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-brand-accentLight border border-brand-accent/40 text-[11px] font-semibold uppercase tracking-wider">
              {currentTrack.series}
            </span>
            <span className="text-xs text-neutral-400">• {currentTrack.date}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {currentTrack.description}
          </p>
        </div>

        {/* Dynamic Sound Waveform visualizer */}
        <div className="flex items-end gap-1.5 h-12 py-1 px-4 bg-neutral-950/80 rounded-2xl border border-neutral-800">
          {[40, 75, 95, 60, 30, 85, 100, 50, 65, 80, 45, 90, 70, 35, 95, 60].map(
            (height, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${height}%` : "18%",
                  transition: "height 0.2s ease",
                  animationDelay: `${i * 0.05}s`,
                }}
                className={`w-1 rounded-full ${
                  isPlaying
                    ? "bg-gradient-to-t from-brand-accent to-brand-accentLight animate-pulse"
                    : "bg-neutral-700"
                }`}
              />
            )
          )}
        </div>
      </div>

      {/* Player Controls & Progress */}
      <div className="mt-8 space-y-4">
        {/* Seek Bar */}
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400">
            <span>{formatCurrentTime()}</span>
            <span>{currentTrack.durationStr}</span>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                selectTrack((currentTrackIndex - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length)
              }
              className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
              aria-label="Piste précédente"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="h-12 w-12 rounded-2xl bg-brand-accent hover:bg-brand-accentLight text-white flex items-center justify-center font-bold shadow-lg shadow-brand-accent/25 transition-transform duration-200 active:scale-95"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() =>
                selectTrack((currentTrackIndex + 1) % DEMO_TRACKS.length)
              }
              className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
              aria-label="Piste suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium">
              <Mic className="w-4 h-4 text-brand-accentLight" />
              <span>Prise de son studio Neumann U87</span>
            </div>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
              aria-label="Activer ou couper le son"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
