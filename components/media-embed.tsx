"use client";

import { useEffect, useRef, useState, useId } from "react";
import {
  Play,
  Video,
  Radio,
  ExternalLink,
  Sparkles,
  Volume2,
  Headphones,
  Music,
} from "lucide-react";
import { triggerSmartAudioPause, triggerSmartAudioResume } from "@/lib/smart-audio-sync";

interface MediaEmbedProps {
  url: string;
  title?: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "square" | "auto";
  autoMuteBackground?: boolean;
}

type MediaType =
  | "youtube"
  | "vimeo"
  | "spotify"
  | "apple"
  | "soundcloud"
  | "raw-video"
  | "raw-audio"
  | "generic-iframe";

export default function MediaEmbed({
  url,
  title = "Contenu Multimédia",
  className = "",
  aspectRatio = "16/9",
  autoMuteBackground = true,
}: MediaEmbedProps) {
  const uniqueId = useId().replace(/:/g, "");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Détection du type de média
  const mediaInfo = detectMediaType(url);

  // Gestion des événements de message pour YouTube et Vimeo
  useEffect(() => {
    if (!autoMuteBackground || typeof window === "undefined") return;

    const handleWindowMessage = (event: MessageEvent) => {
      // 1. GESTION YOUTUBE IFRAME POSTMESSAGE
      if (
        event.origin.includes("youtube.com") ||
        event.origin.includes("youtube-nocookie.com")
      ) {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

          // Notification de changement d'état du lecteur YouTube
          // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
          if (data && (data.event === "onStateChange" || data.info !== undefined)) {
            const state = typeof data.info === "number" ? data.info : data.info?.playerState;

            if (state === 1) {
              // PLAYING
              if (!isPlayingRef.current) {
                isPlayingRef.current = true;
                setIsPlaying(true);
                triggerSmartAudioPause(`YouTube (${title})`);
              }
            } else if (state === 2 || state === 0) {
              // PAUSED (2) ou ENDED (0)
              if (isPlayingRef.current) {
                isPlayingRef.current = false;
                setIsPlaying(false);
                triggerSmartAudioResume(`YouTube (${title})`);
              }
            }
          }
        } catch {
          // Message non JSON ou interne YouTube
        }
      }

      // 2. GESTION VIMEO POSTMESSAGE
      if (event.origin.includes("vimeo.com")) {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data && data.event) {
            if (data.event === "play") {
              if (!isPlayingRef.current) {
                isPlayingRef.current = true;
                setIsPlaying(true);
                triggerSmartAudioPause(`Vimeo (${title})`);
              }
            } else if (data.event === "pause" || data.event === "finish") {
              if (isPlayingRef.current) {
                isPlayingRef.current = false;
                setIsPlaying(false);
                triggerSmartAudioResume(`Vimeo (${title})`);
              }
            }
          }
        } catch {
          // Ignorer
        }
      }
    };

    window.addEventListener("message", handleWindowMessage);

    // Initialisation du listener YouTube dans l'iframe
    const initTimer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "listening", id: uniqueId }),
          "*"
        );
      }
    }, 1200);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("message", handleWindowMessage);
      if (isPlayingRef.current) {
        isPlayingRef.current = false;
        triggerSmartAudioResume(`MediaEmbed (${title})`);
      }
    };
  }, [autoMuteBackground, title, uniqueId]);

  if (!url) return null;

  // Gestion des événements HTML5 natifs (audio/vidéo)
  const handleHtml5Play = () => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (autoMuteBackground) {
        triggerSmartAudioPause(`Lecteur HTML5 (${title})`);
      }
    }
  };

  const handleHtml5PauseOrEnd = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (autoMuteBackground) {
        triggerSmartAudioResume(`Lecteur HTML5 (${title})`);
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl transition-all duration-300 ${
        isPlaying ? "ring-2 ring-brand-accent/50 shadow-brand-accent/15" : ""
      } ${className}`}
    >
      {/* En-tête / Badge du lecteur */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-primary border border-brand-accent/30 text-brand-accentLight">
            {mediaInfo.type === "youtube" || mediaInfo.type === "vimeo" || mediaInfo.type === "raw-video" ? (
              <Video className="w-3.5 h-3.5" />
            ) : mediaInfo.type === "spotify" || mediaInfo.type === "apple" || mediaInfo.type === "soundcloud" ? (
              <Music className="w-3.5 h-3.5" />
            ) : (
              <Radio className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-xs font-bold text-white tracking-tight truncate max-w-[220px] sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>En lecture (Son ambiant coupé)</span>
            </span>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir sur la plateforme d'origine"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Rendu dynamique selon le type de source */}
      <div className="relative w-full bg-black flex items-center justify-center">
        {/* CAS 1 : YOUTUBE */}
        {mediaInfo.type === "youtube" && mediaInfo.id && (() => {
          const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
          const embedSrc = `https://www.youtube-nocookie.com/embed/${mediaInfo.id}?enablejsapi=1${originParam}&rel=0&modestbranding=1`;
          return (
            <div className="w-full aspect-video">
              <iframe
                ref={iframeRef}
                id={`yt-player-${uniqueId}`}
                src={embedSrc}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          );
        })()}

        {/* CAS 2 : VIMEO */}
        {mediaInfo.type === "vimeo" && mediaInfo.id && (
          <div className="w-full aspect-video">
            <iframe
              ref={iframeRef}
              src={`https://player.vimeo.com/video/${mediaInfo.id}?api=1`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* CAS 3 : SPOTIFY */}
        {mediaInfo.type === "spotify" && (
          <div className="w-full p-2 bg-neutral-900/40">
            <iframe
              src={mediaInfo.embedUrl}
              title={title}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-2xl border-0"
            />
          </div>
        )}

        {/* CAS 4 : APPLE PODCASTS */}
        {mediaInfo.type === "apple" && (
          <div className="w-full p-2 bg-neutral-900/40">
            <iframe
              src={mediaInfo.embedUrl}
              title={title}
              width="100%"
              height="175"
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
              loading="lazy"
              className="rounded-2xl border-0 overflow-hidden"
            />
          </div>
        )}

        {/* CAS 5 : SOUNDCLOUD */}
        {mediaInfo.type === "soundcloud" && (
          <div className="w-full p-2 bg-neutral-900/40">
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                url
              )}&color=%23db8636&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
              className="rounded-xl border-0"
            />
          </div>
        )}

        {/* CAS 6 : FICHIER VIDÉO BRUT HTML5 */}
        {mediaInfo.type === "raw-video" && (
          <div className="w-full aspect-video bg-black flex items-center justify-center">
            <video
              src={url}
              controls
              onPlay={handleHtml5Play}
              onPause={handleHtml5PauseOrEnd}
              onEnded={handleHtml5PauseOrEnd}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* CAS 7 : FICHIER AUDIO BRUT HTML5 */}
        {mediaInfo.type === "raw-audio" && (
          <div className="w-full p-6 bg-gradient-to-r from-neutral-900 via-brand-secondary/40 to-neutral-900 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <Headphones className="w-4 h-4 text-brand-accent" />
              <span>Lecteur Audio Haute Définition</span>
            </div>
            <audio
              src={url}
              controls
              onPlay={handleHtml5Play}
              onPause={handleHtml5PauseOrEnd}
              onEnded={handleHtml5PauseOrEnd}
              className="w-full accent-brand-accent"
            />
          </div>
        )}

        {/* CAS 8 : GENERIC IFRAME / FALLBACK */}
        {mediaInfo.type === "generic-iframe" && (
          <div className="w-full aspect-video">
            <iframe
              ref={iframeRef}
              src={url}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Analyse l'URL pour identifier la plateforme et formater l'embed
 */
function detectMediaType(url: string): {
  type: MediaType;
  id?: string;
  embedUrl?: string;
} {
  if (!url) return { type: "generic-iframe" };

  const trimmed = url.trim();

  // 1. YouTube
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/) ||
    trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/);

  if (ytMatch && ytMatch[1]) {
    return { type: "youtube", id: ytMatch[1] };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return { type: "vimeo", id: vimeoMatch[3] };
  }

  // 3. Spotify
  if (trimmed.includes("open.spotify.com")) {
    let embedUrl = trimmed;
    if (!trimmed.includes("/embed/")) {
      embedUrl = trimmed.replace("open.spotify.com/", "open.spotify.com/embed/");
    }
    return { type: "spotify", embedUrl };
  }

  // 4. Apple Podcasts
  if (trimmed.includes("podcasts.apple.com")) {
    let embedUrl = trimmed;
    if (!trimmed.includes("embed.podcasts.apple.com")) {
      embedUrl = trimmed.replace("podcasts.apple.com", "embed.podcasts.apple.com");
    }
    return { type: "apple", embedUrl };
  }

  // 5. Soundcloud
  if (trimmed.includes("soundcloud.com")) {
    return { type: "soundcloud", embedUrl: trimmed };
  }

  // 6. Fichiers vidéo bruts
  if (/\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(trimmed)) {
    return { type: "raw-video" };
  }

  // 7. Fichiers audio bruts
  if (/\.(mp3|wav|ogg|aac|m4a|flac)(\?.*)?$/i.test(trimmed)) {
    return { type: "raw-audio" };
  }

  return { type: "generic-iframe" };
}
