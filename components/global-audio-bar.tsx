"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAudioPlayer } from "@/lib/audio-player-context";
import { Play, Pause, X, Volume2, VolumeX, Disc3 } from "lucide-react";

export default function GlobalAudioBar() {
  const { currentTrack, isPlaying, togglePlay, stop } = useAudioPlayer();
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("00:00");
  const [durationStr, setDurationStr] = useState("00:00");

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-brand-secondary/95 border border-brand-accent/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3.5">
        {/* Disque rotatif */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-brand-primary border border-brand-accent/30 flex items-center justify-center text-brand-accent shadow-md">
            <Disc3 className={`w-6 h-6 ${isPlaying ? "animate-spin text-brand-accentLight" : ""}`} />
          </div>
        </div>

        {/* Détails du morceau */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-primary/80 px-2 py-0.5 rounded-full border border-brand-accent/20">
              {currentTrack.podcastTitle || "Audio Épisode"}
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate mt-1">
            {currentTrack.title}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Studio preview</span>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white flex items-center justify-center shadow-lg shadow-brand-accent/30 transition active:scale-95"
            title={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={stop}
            className="w-8 h-8 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
            title="Fermer le lecteur"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
