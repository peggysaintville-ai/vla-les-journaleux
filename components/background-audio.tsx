"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Radio } from "lucide-react";
import { onSmartAudioPause, onSmartAudioResume } from "@/lib/smart-audio-sync";

// Piste d'ambiance sonore feutrée d'investigation par défaut
const DEFAULT_AMBIENT_TRACK_URL = "/audio/ambient-studio.wav";

interface BackgroundAudioProps {
  enabled?: boolean;
  audioUrl?: string | null;
  title?: string | null;
  defaultVolume?: number;
}

export default function BackgroundAudio({
  enabled = true,
  audioUrl,
  title = "Immersion Studio • 432 Hz",
  defaultVolume = 0.25,
}: BackgroundAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSmartPaused, setIsSmartPaused] = useState(false);
  const [activeMediaSource, setActiveMediaSource] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userWantsPlayRef = useRef(false);

  const finalAudioUrl = audioUrl?.trim() || DEFAULT_AMBIENT_TRACK_URL;

  // Configuration du volume initial et écouteurs Smart Audio Sync
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    if (audioRef.current) {
      audioRef.current.volume = defaultVolume;
    }

    // Écouteur Smart Audio Pause (déclenché quand un média externe est lancé)
    const unsubscribePause = onSmartAudioPause((detail) => {
      if (userWantsPlayRef.current && audioRef.current) {
        setIsSmartPaused(true);
        setActiveMediaSource(detail.source || "Média externe");
        audioRef.current.pause();
        setIsPlaying(false);
      }
    });

    // Écouteur Smart Audio Resume (déclenché quand le média externe se termine ou est mis en pause)
    const unsubscribeResume = onSmartAudioResume(() => {
      if (userWantsPlayRef.current && audioRef.current) {
        setIsSmartPaused(false);
        setActiveMediaSource(null);
        audioRef.current.volume = defaultVolume;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Reprise automatique bloquée par le navigateur :", err);
          });
      }
    });

    return () => {
      unsubscribePause();
      unsubscribeResume();
    };
  }, [enabled, defaultVolume]);

  // Bascule Play / Pause directe
  const toggleAmbientSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      userWantsPlayRef.current = false;
      setIsSmartPaused(false);
      audio.pause();
      setIsPlaying(false);
    } else {
      userWantsPlayRef.current = true;
      setIsSmartPaused(false);
      audio.volume = defaultVolume;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Lecture audio bloquée par la politique d'autoplay :", err);
            setIsPlaying(false);
          });
      }
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Balise audio HTML5 persistante connectée aux settings Neon */}
      <audio
        ref={audioRef}
        src={finalAudioUrl}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={toggleAmbientSound}
        id="toggle-ambient-audio-btn"
        title={isPlaying ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
        aria-label={isPlaying ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 text-left cursor-pointer group active:scale-95 select-none ${
          isPlaying
            ? "bg-neutral-900/95 border-brand-accent/60 text-white shadow-brand-accent/25 ring-1 ring-brand-accent/30"
            : isSmartPaused
            ? "bg-amber-950/85 border-amber-500/40 text-amber-200"
            : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900/95"
        }`}
      >
        {/* Indicateur visuel d'état : Égaliseur dynamique ou icône radio */}
        {isPlaying ? (
          <div className="flex items-end gap-1 h-3.5 px-0.5" aria-hidden="true">
            <span className="w-1 bg-brand-accent rounded-full animate-[bounce_0.8s_infinite] h-3" />
            <span className="w-1 bg-brand-accentLight rounded-full animate-[bounce_0.6s_infinite] h-4" />
            <span className="w-1 bg-amber-400 rounded-full animate-[bounce_1s_infinite] h-2" />
            <span className="w-1 bg-brand-accent rounded-full animate-[bounce_0.7s_infinite] h-3.5" />
          </div>
        ) : isSmartPaused ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        ) : (
          <Radio className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
        )}

        {/* Textes d'état informatifs */}
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide leading-tight">
            <span>{isPlaying ? "Ambiance active" : isSmartPaused ? "Ambiance en pause" : "Ambiance coupée"}</span>
            {isSmartPaused && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pause Auto
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[170px]">
            {isSmartPaused
              ? `Média en cours (${activeMediaSource})`
              : isPlaying
              ? title
              : "Cliquer pour écouter"}
          </span>
        </div>

        {/* Bouton icône état sonore */}
        <div
          className={`p-2 rounded-full transition-all shrink-0 ${
            isPlaying
              ? "bg-brand-accent text-white shadow-md shadow-brand-accent/40"
              : isSmartPaused
              ? "bg-amber-500/20 text-amber-300"
              : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white"
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </div>
      </button>
    </div>
  );
}
