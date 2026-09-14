"use client";

/**
 * Smart Audio Sync
 * Système de synchronisation audio global pour couper automatiquement
 * la musique d'ambiance de la vitrine lorsqu'un média externe ou une piste audio est joué(e),
 * et la reprendre doucement en fondu (fade-in) dès la pause ou la fin.
 */

export const SMART_AUDIO_PAUSE_EVENT = "smart-audio:pause";
export const SMART_AUDIO_RESUME_EVENT = "smart-audio:resume";

// Suivi du nombre de médias actifs en cours de lecture
let activePlayingMediaCount = 0;

export interface SmartAudioEventDetail {
  source: string;
  reason?: string;
}

/**
 * Met en pause la musique d'ambiance avec fondu sortant
 */
export function triggerSmartAudioPause(source: string, reason = "media-playing") {
  if (typeof window === "undefined") return;

  activePlayingMediaCount++;
  const event = new CustomEvent<SmartAudioEventDetail>(SMART_AUDIO_PAUSE_EVENT, {
    detail: { source, reason },
  });
  window.dispatchEvent(event);
}

/**
 * Reprend la musique d'ambiance avec fondu entrant doux
 */
export function triggerSmartAudioResume(source: string) {
  if (typeof window === "undefined") return;

  activePlayingMediaCount = Math.max(0, activePlayingMediaCount - 1);

  // Ne reprend la musique de fond que si aucun autre média n'est en train de tourner
  if (activePlayingMediaCount === 0) {
    const event = new CustomEvent<SmartAudioEventDetail>(SMART_AUDIO_RESUME_EVENT, {
      detail: { source },
    });
    window.dispatchEvent(event);
  }
}

/**
 * Écouteur pour la coupure audio
 */
export function onSmartAudioPause(
  callback: (detail: SmartAudioEventDetail) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<SmartAudioEventDetail>;
    callback(custom.detail || { source: "unknown" });
  };

  window.addEventListener(SMART_AUDIO_PAUSE_EVENT, handler);
  return () => {
    window.removeEventListener(SMART_AUDIO_PAUSE_EVENT, handler);
  };
}

/**
 * Écouteur pour la reprise audio
 */
export function onSmartAudioResume(
  callback: (detail: SmartAudioEventDetail) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<SmartAudioEventDetail>;
    callback(custom.detail || { source: "unknown" });
  };

  window.addEventListener(SMART_AUDIO_RESUME_EVENT, handler);
  return () => {
    window.removeEventListener(SMART_AUDIO_RESUME_EVENT, handler);
  };
}
