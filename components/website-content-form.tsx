"use client";

import { useActionState, useState } from "react";
import type { WebsiteContentData } from "@/lib/website-content";
import { VitrineSettingsData, DEFAULT_VITRINE_SETTINGS } from "@/lib/vitrine-settings-types";
import { updateWebsiteContentAction } from "@/app/(app)/site-vitrine/actions";
import MediaEmbed from "@/components/media-embed";
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Eye,
  Edit3,
  Mail,
  Music,
  Tv,
  Share2,
  Info,
  Radio,
  Calendar,
  Video,
  Layers,
  Volume2,
  Sliders,
  Check,
} from "lucide-react";

interface WebsiteContentFormProps {
  initialContent: WebsiteContentData;
  initialVitrineSettings?: VitrineSettingsData;
}

export default function WebsiteContentForm({
  initialContent,
  initialVitrineSettings,
}: WebsiteContentFormProps) {
  const settings = initialVitrineSettings || {
    ...DEFAULT_VITRINE_SETTINGS,
    showTeaserBanner: initialContent.teaserEnabled,
    teaserTitle: initialContent.teaserTitle,
    teaserSubtitle: initialContent.teaserHook,
    teaserExternalLink: initialContent.teaserLinkUrl,
    videoUrl: initialContent.videoUrl,
    audioEmbedUrl: initialContent.audioEmbedUrl,
  };

  const [state, formAction, isSaving] = useActionState(async (prev: unknown, fd: FormData) => {
    return await updateWebsiteContentAction(prev, fd);
  }, null);

  const [previewTitle, setPreviewTitle] = useState(initialContent.heroTitle);
  const [previewSubtitle, setPreviewSubtitle] = useState(initialContent.heroSubtitle);
  const [videoUrlPreview, setVideoUrlPreview] = useState(settings.videoUrl || "");
  const [audioEmbedPreview, setAudioEmbedPreview] = useState(settings.audioEmbedUrl || "");

  // Interrupteurs d'état local pour aperçu visuel dynamique
  const [showTeaser, setShowTeaser] = useState(settings.showTeaserBanner);
  const [showAudioBg, setShowAudioBg] = useState(settings.showAudioBackground);
  const [showPodcasts, setShowPodcasts] = useState(settings.showPodcastsSection);
  const [showArticles, setShowArticles] = useState(settings.showArticlesSection);
  const [showBio, setShowBio] = useState(settings.showBioSection);
  const [showContact, setShowContact] = useState(settings.showContactSection);

  return (
    <form action={formAction} className="space-y-8 pb-16">
      {/* Toast Feedback */}
      {state?.success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs font-semibold shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{state.message}</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 transition"
          >
            <span>Voir le site en direct</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* 1. CARTE MODULARITÉ NO-CODE : PILOTAGE DES SECTIONS DE LA VITRINE */}
      <div className="bg-gradient-to-r from-brand-secondary via-brand-primary to-neutral-900 border border-brand-accent/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-accent/20 text-brand-accentLight border border-brand-accent/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Pilotage Modulaire des Sections (No-Code)
              </h2>
              <p className="text-xs text-neutral-300">
                Activez ou masquez les différentes zones de votre vitrine d&apos;un simple clic.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-brand-accentLight border border-brand-accent/30 w-fit">
            Mode Modulaire Actif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Switch Podcasts & Créations Sonores */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-brand-accent" />
                <span>Section Podcasts</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {showPodcasts ? "Visible sur vitrine" : "Masquée"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="showPodcastsSection"
                checked={showPodcasts}
                onChange={(e) => setShowPodcasts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent transition-colors"></div>
            </label>
          </div>

          {/* Switch Articles & Enquêtes */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Section Enquêtes</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {showArticles ? "Visible sur vitrine" : "Masquée"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="showArticlesSection"
                checked={showArticles}
                onChange={(e) => setShowArticles(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-colors"></div>
            </label>
          </div>

          {/* Switch Bio & Manifeste */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Section Bio</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {showBio ? "Visible sur vitrine" : "Masquée"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="showBioSection"
                checked={showBio}
                onChange={(e) => setShowBio(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 transition-colors"></div>
            </label>
          </div>

          {/* Switch Contact & Devis */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Section Contact</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {showContact ? "Visible sur vitrine" : "Masquée"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="showContactSection"
                checked={showContact}
                onChange={(e) => setShowContact(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 transition-colors"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Principale */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2. CARTE TEASER & PROCHAIN PROJET */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Campagne Teaser & Prochain Projet (À la une)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Bannière immersive affichée en tête de vitrine pour annoncer une sortie imminente.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-brand-accent transition">
                <input
                  type="checkbox"
                  name="showTeaserBanner"
                  checked={showTeaser}
                  onChange={(e) => setShowTeaser(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 text-brand-accent focus:ring-brand-accent bg-neutral-900"
                />
                <span className="text-xs font-bold text-white">Activer le Teaser</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Titre du Projet en Teasing
                </label>
                <input
                  type="text"
                  name="teaserTitle"
                  defaultValue={settings.teaserTitle || ""}
                  placeholder="Ex : L'Or Vert des Caraïbes : Le Scandale des Terres Confisquées"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Sous-titre / Phrase d&apos;Accroche Teaser
                </label>
                <textarea
                  name="teaserSubtitle"
                  rows={2}
                  defaultValue={settings.teaserSubtitle || ""}
                  placeholder="Une enquête sonore exclusive en 4 épisodes sur les dépossessions foncières..."
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Extrait Sonore / Trailer (URL MP3)
                </label>
                <input
                  type="url"
                  name="teaserAudioUrl"
                  defaultValue={settings.teaserAudioUrl || ""}
                  placeholder="https://audio.local/trailers/teaser-ep1.mp3"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Lien externe (Instagram, YouTube, Teaser vidéo)
                </label>
                <input
                  type="url"
                  name="teaserExternalLink"
                  defaultValue={settings.teaserExternalLink || "https://instagram.com/vlalesjournaleux"}
                  placeholder="https://instagram.com/vlalesjournaleux"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* 3. CARTE LECTEURS MULTIMÉDIAS EXTERNES (EMBEDS) */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-primary text-brand-accentLight border border-brand-accent/30">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Lecteurs Externes & Embeds (YouTube, Vimeo, Spotify, Apple)
                </h3>
                <p className="text-xs text-neutral-400">
                  Lecteurs synchronisés : le son d&apos;ambiance du site se coupe automatiquement dès la lecture.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lien vidéo (YouTube / Vimeo / MP4)</span>
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={videoUrlPreview}
                  onChange={(e) => setVideoUrlPreview(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lien lecteur podcast externe (Spotify / Apple Podcasts / SoundCloud)</span>
                </label>
                <input
                  type="url"
                  name="audioEmbedUrl"
                  value={audioEmbedPreview}
                  onChange={(e) => setAudioEmbedPreview(e.target.value)}
                  placeholder="https://open.spotify.com/episode/... ou https://podcasts.apple.com/..."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              {/* Aperçu direct en live */}
              {(videoUrlPreview || audioEmbedPreview) && (
                <div className="pt-3 border-t border-neutral-800/80">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">
                    Aperçu interactif de l&apos;intégration :
                  </span>
                  {videoUrlPreview && (
                    <MediaEmbed
                      url={videoUrlPreview}
                      title="Aperçu Lecteur Vidéo Externe"
                      className="mb-3"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. CARTE MUSIQUE D'AMBIANCE & SMART AUDIO MUTE */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Musique d&apos;Ambiance Vitrine (Immersion Studio)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Bouton discret au bas de l&apos;écran, volume calibré à 20% par défaut avec coupure intelligente automatique.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-brand-accent transition">
                <input
                  type="checkbox"
                  name="showAudioBackground"
                  checked={showAudioBg}
                  onChange={(e) => setShowAudioBg(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 text-brand-accent focus:ring-brand-accent bg-neutral-900"
                />
                <span className="text-xs font-bold text-white">Activer l&apos;Ambiance</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Titre de la Piste d&apos;Ambiance
                </label>
                <input
                  type="text"
                  name="audioBackgroundTitle"
                  defaultValue={settings.audioBackgroundTitle || "Ambiance Studio d'Investigation (432 Hz)"}
                  placeholder="Ambiance Studio d'Investigation (432 Hz)"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Fichier Audio MP3 / OGG (URL)
                </label>
                <input
                  type="url"
                  name="audioBackgroundUrl"
                  defaultValue={settings.audioBackgroundUrl || "https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg"}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
              <Sparkles className="w-4 h-4 text-brand-accentLight shrink-0" />
              <span>
                <strong>Smart Interruption :</strong> dès qu&apos;une vidéo YouTube ou un podcast démarre, la musique se coupe instantanément en fondu. Elle reprend doucement dès que la vidéo s&apos;arrête.
              </span>
            </div>
          </div>

          {/* 5. CARTE MANIFESTE & BIO ÉDITORIALE */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Manifeste & Biographie Éditoriale (Section #bio)
                </h3>
                <p className="text-xs text-neutral-400">
                  Présentation de votre démarche, de vos valeurs déontologiques et de votre méthode d&apos;investigation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Titre du Manifeste (H2)
                </label>
                <input
                  type="text"
                  name="bioTitle"
                  defaultValue={settings.bioTitle || "L'indépendance comme boussole, l'humain comme centre."}
                  placeholder="L'indépendance comme boussole, l'humain comme centre."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Texte Complet du Manifeste (Sauts de lignes préservés)
                </label>
                <textarea
                  name="bioText"
                  rows={6}
                  defaultValue={settings.bioText || initialContent.bioText}
                  placeholder="Diplômée de l'Institut Français de Presse..."
                  className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 leading-relaxed placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale : Accroche Hero & Coordonnées */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Hero Header */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/80 text-white font-bold text-sm">
              <Edit3 className="w-4 h-4 text-brand-accent" />
              <span>Accroche Hero d&apos;Accueil</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Titre H1 *
                </label>
                <input
                  type="text"
                  name="heroTitle"
                  required
                  defaultValue={initialContent.heroTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Sous-titre *
                </label>
                <textarea
                  name="heroSubtitle"
                  required
                  rows={3}
                  defaultValue={initialContent.heroSubtitle}
                  onChange={(e) => setPreviewSubtitle(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                />
              </div>
            </div>
          </div>

          {/* Card Contact Public */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/80 text-white font-bold text-sm">
              <Mail className="w-4 h-4 text-brand-accent" />
              <span>Email Public de Contact</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email affiché *
              </label>
              <input
                type="email"
                name="contactEmail"
                required
                defaultValue={initialContent.contactEmail}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Card Réseaux Sociaux */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80 text-white font-bold text-sm">
              <Share2 className="w-4 h-4 text-brand-accent" />
              <span>Réseaux Professionnels</span>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                name="socialSpotify"
                defaultValue={initialContent.socialSpotify || ""}
                placeholder="Lien Spotify"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
              />
              <input
                type="url"
                name="socialApple"
                defaultValue={initialContent.socialApple || ""}
                placeholder="Lien Apple Podcasts"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
              />
              <input
                type="url"
                name="socialYoutube"
                defaultValue={initialContent.socialYoutube || ""}
                placeholder="Chaîne YouTube"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
              />
              <input
                type="url"
                name="socialInstagram"
                defaultValue={initialContent.socialInstagram || ""}
                placeholder="Compte Instagram"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bouton d'enregistrement général */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition"
        >
          <ExternalLink className="w-4 h-4 text-brand-accent" />
          <span>Prévisualiser le site vitrine</span>
        </a>

        <button
          type="submit"
          disabled={isSaving}
          id="save-website-content-btn"
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs sm:text-sm font-bold shadow-xl shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer & Publier la Vitrine</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
