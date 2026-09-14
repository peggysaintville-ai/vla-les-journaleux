"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Sparkles, Radio } from "lucide-react";
import { onSmartAudioPause, onSmartAudioResume } from "@/lib/smart-audio-sync";

// Piste d'ambiance sonore feutrée d'investigation
const DEFAULT_AMBIENT_TRACK_URL =
  "https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg";

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
  defaultVolume = 0.20,
}: BackgroundAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSmartPaused, setIsSmartPaused] = useState(false);
  const [activeMediaSource, setActiveMediaSource] = useState<string | null>(null);
  const [volume, setVolume] = useState(defaultVolume);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userWantsPlayRef = useRef(false);

  const finalAudioUrl = audioUrl || DEFAULT_AMBIENT_TRACK_URL;

  // Initialisation de l'élément audio natif
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const audio = new Audio();
    audio.src = finalAudioUrl;
    audio.loop = true;
    audio.volume = defaultVolume;
    audio.preload = "none";
    audioRef.current = audio;

    // Écouteur Smart Audio Pause (déclenché par YouTube, Vimeo, Spotify, audio player)
    const unsubscribePause = onSmartAudioPause((detail) => {
      if (userWantsPlayRef.current && audioRef.current) {
        setIsSmartPaused(true);
        setActiveMediaSource(detail.source || "Média externe");
        fadeVolume(audioRef.current, 0, 400, () => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        });
      }
    });

    // Écouteur Smart Audio Resume (déclenché à la fin ou mise en pause du média externe)
    const unsubscribeResume = () => onSmartAudioResume(() => {
      if (userWantsPlayRef.current && audioRef.current) {
        setIsSmartPaused(false);
        setActiveMediaSource(null);
        audioRef.current.volume = 0;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            if (audioRef.current) {
              fadeVolume(audioRef.current, 0.25, 1000);
            }
          })
          .catch(() => {
            // Autoplay restriction si l'utilisateur n'a pas encore interagi
          });
      }
    });

    const cleanupResume = unsubscribeResume();

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      unsubscribePause();
      cleanupResume();
    };
  }, []);

  // Fonction utilitaire de fondu audio (Fade In / Fade Out)
  const fadeVolume = (
    audio: HTMLAudioElement,
    targetVolume: number,
    durationMs: number,
    onComplete?: () => void
  ) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const stepMs = 25;
    const steps = Math.max(1, durationMs / stepMs);
    const startVolume = audio.volume;
    const delta = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const nextVolume = Math.min(1, Math.max(0, startVolume + delta * currentStep));
      audio.volume = nextVolume;
      setVolume(nextVolume);

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        audio.volume = targetVolume;
        setVolume(targetVolume);
        if (onComplete) onComplete();
      }
    }, stepMs);
  };

  const toggleAmbientSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      userWantsPlayRef.current = false;
      setIsSmartPaused(false);
      fadeVolume(audioRef.current, 0, 300, () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
    } else {
      userWantsPlayRef.current = true;
      setIsSmartPaused(false);
      audioRef.current.volume = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (audioRef.current) {
            fadeVolume(audioRef.current, 0.25, 600);
          }
        })
        .catch((err) => {
          console.warn("Lecture bloquée par le navigateur :", err);
        });
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <div
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isPlaying
            ? "bg-neutral-900/90 border-brand-accent/60 text-white shadow-brand-accent/20"
            : isSmartPaused
            ? "bg-amber-950/80 border-amber-500/40 text-amber-200"
            : "bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-white"
        }`}
      >
        {/* Visualiseur de spectre sonore dynamique */}
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
          <Radio className="w-4 h-4 shrink-0 text-neutral-500" />
        )}

        <div className="flex flex-col text-left pr-1 select-none">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide leading-tight">
            <span>Ambiance Sonore</span>
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
              : "Cliquer pour activer"}
          </span>
        </div>

        {/* Bouton de contrôle */}
        <button
          type="button"
          onClick={toggleAmbientSound}
          id="toggle-ambient-audio-btn"
          title={isPlaying ? "Couper l'ambiance sonore" : "Activer l'ambiance sonore"}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            isPlaying
              ? "bg-brand-accent text-white hover:bg-brand-accentLight shadow-md"
              : isSmartPaused
              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
