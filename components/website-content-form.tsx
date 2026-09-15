"use client";

import { useActionState, useState, useRef } from "react";
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
  Edit3,
  Mail,
  Music,
  Share2,
  Radio,
  Video,
  Volume2,
  Sliders,
  UserCheck,
  Camera,
  Upload,
  RotateCcw,
  BadgeCheck,
  ZoomIn,
  MoveVertical,
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

  // État local de la section Hero / Identité
  const [heroJournalistName, setHeroJournalistName] = useState(
    settings.heroJournalistName || "Peggy SAINT-VILLE"
  );
  const [heroTitle, setHeroTitle] = useState(
    settings.heroTitle || initialContent.heroTitle || "Révéler le réel : journalisme d'investigation, podcasts et récits engagés."
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    settings.heroSubtitle || initialContent.heroSubtitle || "Studio de Production & Rédaction d'Investigation Sonore"
  );
  const [heroBio, setHeroBio] = useState(
    settings.heroBio || settings.bioText || initialContent.bioText || ""
  );
  const [heroPhotoUrl, setHeroPhotoUrl] = useState(
    settings.heroPhotoUrl || "/images/journalist-portrait.jpg"
  );
  const [photoPreview, setPhotoPreview] = useState(
    settings.heroPhotoUrl || "/images/journalist-portrait.jpg"
  );
  const [heroBadgeStatus, setHeroBadgeStatus] = useState(
    settings.heroBadgeStatus || "En production active"
  );
  const [heroCaption, setHeroCaption] = useState(
    settings.heroCaption || "En direct de la rédaction centrale"
  );

  // Cadrage & Positionnement de la photo
  const initialPosition = settings.heroPhotoPosition || "center center";
  const [heroPhotoPosition, setHeroPhotoPosition] = useState(initialPosition);
  
  // Extraction du pourcentage vertical si format "center X%"
  const getInitialVerticalPercent = (pos: string) => {
    const match = pos.match(/center\s+(\d+)%/);
    if (match) return parseInt(match[1], 10);
    if (pos.includes("top")) return 15;
    if (pos.includes("bottom")) return 85;
    return 50;
  };
  const [verticalPercent, setVerticalPercent] = useState<number>(
    getInitialVerticalPercent(initialPosition)
  );
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [photoStatusMessage, setPhotoStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autres états d'aperçu
  const [videoUrlPreview, setVideoUrlPreview] = useState(settings.videoUrl || "");
  const [audioEmbedPreview, setAudioEmbedPreview] = useState(settings.audioEmbedUrl || "");

  // État de l'extrait audio / teaser
  const [teaserAudioUrl, setTeaserAudioUrl] = useState<string>(settings.teaserAudioUrl || "");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioStatusMessage, setAudioStatusMessage] = useState<string | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // État de la musique d'ambiance
  const [audioBackgroundUrl, setAudioBackgroundUrl] = useState<string>(
    settings.audioBackgroundUrl || "https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg"
  );
  const [isProcessingAmbiance, setIsProcessingAmbiance] = useState(false);
  const [ambianceStatusMessage, setAmbianceStatusMessage] = useState<string | null>(null);
  const ambianceFileInputRef = useRef<HTMLInputElement>(null);

  // Interrupteurs d'état local pour aperçu visuel dynamique
  const [showTeaser, setShowTeaser] = useState(settings.showTeaserBanner);
  const [showAudioBg, setShowAudioBg] = useState(settings.showAudioBackground);
  const [showPodcasts, setShowPodcasts] = useState(settings.showPodcastsSection);
  const [showArticles, setShowArticles] = useState(settings.showArticlesSection);
  const [showBio, setShowBio] = useState(settings.showBioSection);
  const [showContact, setShowContact] = useState(settings.showContactSection);

  // Traitement du fichier audio téléversé
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingAudio(true);
    setAudioStatusMessage("Lecture et encodage du fichier audio...");

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (result) {
        setTeaserAudioUrl(result);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setAudioStatusMessage(`Extrait audio "${file.name}" prêt (${sizeMb} Mo)`);
      }
      setIsProcessingAudio(false);
    };
    reader.onerror = () => {
      setIsProcessingAudio(false);
      setAudioStatusMessage("Erreur lors de la lecture du fichier audio.");
    };
    reader.readAsDataURL(file);
  };

  // Traitement du fichier audio d'ambiance téléversé
  const handleAmbianceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingAmbiance(true);
    setAmbianceStatusMessage("Lecture et encodage de la musique d'ambiance...");

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (result) {
        setAudioBackgroundUrl(result);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setAmbianceStatusMessage(`Piste audio "${file.name}" prête (${sizeMb} Mo)`);
      }
      setIsProcessingAmbiance(false);
    };
    reader.onerror = () => {
      setIsProcessingAmbiance(false);
      setAmbianceStatusMessage("Erreur lors de la lecture du fichier audio.");
    };
    reader.readAsDataURL(file);
  };

  // Traitement et compression côté client de l'image sélectionnée
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setPhotoStatusMessage("Optimisation et compression de l'image...");

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        // Redimensionnement haute définition mais optimisé (max 1200px)
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          // Export JPEG compressé de haute qualité (88%)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setHeroPhotoUrl(compressedDataUrl);
          setPhotoPreview(compressedDataUrl);

          const sizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
          setPhotoStatusMessage(`Photo "${file.name}" prête (${sizeKb} Ko)`);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setPhotoStatusMessage("Erreur lors de la lecture de l'image.");
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = () => {
    setHeroPhotoUrl("/images/journalist-portrait.jpg");
    setPhotoPreview("/images/journalist-portrait.jpg");
    setHeroPhotoPosition("center center");
    setVerticalPercent(50);
    setPhotoZoom(1);
    setPhotoStatusMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const applyPositionPreset = (type: "top" | "center" | "bottom") => {
    if (type === "top") {
      setHeroPhotoPosition("center 15%");
      setVerticalPercent(15);
    } else if (type === "center") {
      setHeroPhotoPosition("center 50%");
      setVerticalPercent(50);
    } else if (type === "bottom") {
      setHeroPhotoPosition("center 85%");
      setVerticalPercent(85);
    }
  };

  const handleVerticalSliderChange = (val: number) => {
    setVerticalPercent(val);
    setHeroPhotoPosition(`center ${val}%`);
  };

  return (
    <form action={formAction} className="space-y-8 pb-16">
      {/* Inputs cachés garantissant la persistance de l'image et du cadrage */}
      <input type="hidden" name="heroPhotoUrl" value={heroPhotoUrl} />
      <input type="hidden" name="heroPhotoPosition" value={heroPhotoPosition} />

      {/* Toast Feedback Supérieur */}
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 transition"
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

      {/* 1. CARTE PRINCIPALE : IDENTITÉ & PRÉSENTATION HERO (CMS COMPLET) */}
      <div className="bg-neutral-900/80 border border-brand-accent/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-primary text-brand-accent border border-brand-accent/30 shadow-md">
              <UserCheck className="w-6 h-6 text-brand-accentLight" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Identité & Présentation Hero</span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30">
                  En-tête Vitrine
                </span>
              </h2>
              <p className="text-xs text-neutral-300">
                Personnalisez le nom officiel, le portrait, le cadrage, le titre H1 et le statut d&apos;activité sans toucher au code.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synchro Directe Neon</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulaire des textes */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nom complet du journaliste */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                  Nom du Journaliste affiché *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="heroJournalistName"
                    required
                    value={heroJournalistName}
                    onChange={(e) => setHeroJournalistName(e.target.value)}
                    placeholder="ex: Peggy SAINT-VILLE"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white font-medium placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                  />
                  <BadgeCheck className="w-4 h-4 text-brand-accentLight absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Header, footer, signatures d&apos;articles et badges.
                </p>
              </div>

              {/* Sous-titre / Positionnement */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                  Sous-titre / Positionnement *
                </label>
                <input
                  type="text"
                  name="heroSubtitle"
                  required
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Studio de Production & Rédaction d'Investigation Sonore"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Accroche sous le titre principal.
                </p>
              </div>
            </div>

            {/* Titre H1 Hero */}
            <div>
              <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                Titre Principal H1 (Accroche Majeure) *
              </label>
              <textarea
                name="heroTitle"
                required
                rows={2}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Révéler le réel : journalisme d'investigation, podcasts et récits engagés."
                className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white font-semibold placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition leading-snug"
              />
            </div>

            {/* Biographie de présentation */}
            <div>
              <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                Texte de Présentation & Biographie Complète
              </label>
              <textarea
                name="heroBio"
                rows={5}
                value={heroBio}
                onChange={(e) => setHeroBio(e.target.value)}
                placeholder="Diplômée de l'Institut Français de Presse..."
                className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Légende photo */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                  Légende sous la Photo
                </label>
                <input
                  type="text"
                  name="heroCaption"
                  value={heroCaption}
                  onChange={(e) => setHeroCaption(e.target.value)}
                  placeholder="En direct de la rédaction centrale"
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              {/* Statut d'activité */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2">
                  Statut & Disponibilité
                </label>
                <input
                  type="text"
                  name="heroBadgeStatus"
                  value={heroBadgeStatus}
                  onChange={(e) => setHeroBadgeStatus(e.target.value)}
                  placeholder="En production active"
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* Gestion de la photo, cadrage & Prévisualisation en direct */}
          <div className="lg:col-span-5 space-y-4 bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Camera className="w-4 h-4 text-brand-accent" />
                <span>Photo & Cadrage Portrait</span>
              </div>
              <button
                type="button"
                onClick={handleResetPhoto}
                title="Rétablir l'image par défaut"
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Cadre de prévisualisation miroir fidèle de la landing page */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/50 shadow-xl group">
              <div className="aspect-[4/3] relative w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt={`${heroJournalistName} - Prévisualisation`}
                  style={{
                    objectPosition: heroPhotoPosition,
                    transform: photoZoom > 1 ? `scale(${photoZoom})` : undefined,
                  }}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={() => setPhotoPreview("/images/journalist-portrait.jpg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                <span className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-neutral-300 border border-white/10 pointer-events-none">
                  Aperçu Live Vitrine
                </span>
              </div>

              <div className="p-3 bg-neutral-900/90 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {heroJournalistName || "Peggy SAINT-VILLE"}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {heroCaption || "En direct de la rédaction centrale"}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{heroBadgeStatus || "En production active"}</span>
                </div>
              </div>
            </div>

            {/* Outils d'ajustement / Cadrage du visage */}
            <div className="space-y-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <MoveVertical className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Cadrage du visage</span>
                </span>
                <span className="font-mono text-[11px] text-brand-accentLight">
                  {verticalPercent}%
                </span>
              </div>

              {/* Boutons de presets rapides */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPositionPreset("top")}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    verticalPercent <= 30
                      ? "bg-brand-accent text-white border-brand-accent"
                      : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white"
                  }`}
                >
                  Haut (Visage)
                </button>
                <button
                  type="button"
                  onClick={() => applyPositionPreset("center")}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    verticalPercent > 30 && verticalPercent < 70
                      ? "bg-brand-accent text-white border-brand-accent"
                      : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white"
                  }`}
                >
                  Centré
                </button>
                <button
                  type="button"
                  onClick={() => applyPositionPreset("bottom")}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition border ${
                    verticalPercent >= 70
                      ? "bg-brand-accent text-white border-brand-accent"
                      : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white"
                  }`}
                >
                  Bas
                </button>
              </div>

              {/* Slider d'ajustement vertical fin */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mb-1">
                  <span>Haut (0%)</span>
                  <span>Ajustement précis</span>
                  <span>Bas (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={verticalPercent}
                  onChange={(e) => handleVerticalSliderChange(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              {/* Slider de zoom / échelle */}
              <div className="pt-1 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-200 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Zoom de l&apos;image</span>
                  </span>
                  <span className="font-mono text-[11px] text-brand-accentLight">
                    {photoZoom}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1.5"
                  step="0.05"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>
            </div>

            {/* Actions de changement de photo */}
            <div className="space-y-2 pt-1">
              {/* Bouton de sélection / téléversement local avec compression automatique */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="heroPhotoFileInput"
                  disabled={isProcessingImage}
                />
                <label
                  htmlFor="heroPhotoFileInput"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/40 text-xs font-bold cursor-pointer transition shadow-md"
                >
                  {isProcessingImage ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Compression en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-brand-accentLight" />
                      <span>Téléverser depuis l&apos;ordinateur</span>
                    </>
                  )}
                </label>
              </div>

              {photoStatusMessage && (
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{photoStatusMessage}</span>
                </div>
              )}

              {/* Champ d'URL manuelle directe */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Ou coller une URL d&apos;image externe :
                </label>
                <input
                  type="text"
                  value={heroPhotoUrl.startsWith("data:") ? "" : heroPhotoUrl}
                  onChange={(e) => {
                    setHeroPhotoUrl(e.target.value);
                    setPhotoPreview(e.target.value || "/images/journalist-portrait.jpg");
                  }}
                  placeholder={heroPhotoUrl.startsWith("data:") ? "Image encodée en base64 prête" : "https://... ou /images/portrait.jpg"}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent transition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARTE MODULARITÉ NO-CODE : PILOTAGE DES SECTIONS DE LA VITRINE */}
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
          {/* 3. CARTE TEASER & PROCHAIN PROJET */}
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
                  defaultValue={settings.teaserTitle || initialContent.teaserTitle || ""}
                  placeholder="L'Or Vert des Caraïbes..."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Sous-titre / Accroche Sonore
                </label>
                <textarea
                  name="teaserSubtitle"
                  rows={2}
                  defaultValue={settings.teaserSubtitle || initialContent.teaserHook || ""}
                  placeholder="Une enquête sonore exclusive en 4 épisodes..."
                  className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition leading-relaxed"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-brand-accentLight" />
                    <span>Extrait sonore / Trailer (URL MP3 ou fichier audio)</span>
                  </label>
                  {teaserAudioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeaserAudioUrl("");
                        setAudioStatusMessage(null);
                        if (audioFileInputRef.current) audioFileInputRef.current.value = "";
                      }}
                      className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retirer l&apos;extrait</span>
                    </button>
                  )}
                </div>

                {/* Input caché soumis au serveur */}
                <input type="hidden" name="teaserAudioUrl" value={teaserAudioUrl} />

                {/* Bouton d'upload direct et champ d'URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/*"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                      id="teaserAudioFileInput"
                      disabled={isProcessingAudio}
                    />
                    <label
                      htmlFor="teaserAudioFileInput"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/40 text-xs font-bold cursor-pointer transition shadow-md"
                    >
                      {isProcessingAudio ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Traitement audio en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-brand-accentLight" />
                          <span>Uploader un fichier audio (.mp3, .wav, .m4a)</span>
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={teaserAudioUrl.startsWith("data:") ? "" : teaserAudioUrl}
                      onChange={(e) => setTeaserAudioUrl(e.target.value)}
                      placeholder={teaserAudioUrl.startsWith("data:") ? "Fichier audio encodé prêt" : "Ou coller une URL https://.../teaser.mp3"}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                    />
                  </div>
                </div>

                {/* Message d'état de l'upload audio */}
                {audioStatusMessage && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{audioStatusMessage}</span>
                  </div>
                )}

                {/* Lecteur audio de pré-écoute en direct */}
                {teaserAudioUrl && (
                  <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-brand-accent/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-brand-accent" />
                        <span>Pré-écoute du trailer en direct</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Prêt pour diffusion
                      </span>
                    </div>
                    <audio
                      controls
                      src={teaserAudioUrl}
                      className="w-full h-8 accent-brand-accent"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Lien Externe / Campagne (Instagram, Spotify...)
                </label>
                <input
                  type="url"
                  name="teaserExternalLink"
                  defaultValue={settings.teaserExternalLink || initialContent.teaserLinkUrl || ""}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>

          {/* 4. CARTE LECTEURS EXTERNES & EMBEDS */}
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

          {/* 5. CARTE MUSIQUE D'AMBIANCE & SMART AUDIO MUTE */}
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

            <div className="space-y-4">
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Fichier Audio MP3 / OGG / WAV (URL ou Upload)</span>
                  </label>
                  {audioBackgroundUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBackgroundUrl("https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg");
                        setAmbianceStatusMessage("Piste d'ambiance réinitialisée par défaut");
                        if (ambianceFileInputRef.current) ambianceFileInputRef.current.value = "";
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rétablir piste par défaut</span>
                    </button>
                  )}
                </div>

                {/* Input caché soumis au serveur pour l'URL ou Data URL */}
                <input type="hidden" name="audioBackgroundUrl" value={audioBackgroundUrl} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bouton d'upload direct */}
                  <div>
                    <input
                      ref={ambianceFileInputRef}
                      type="file"
                      accept=".mp3,.ogg,.wav,audio/*"
                      onChange={handleAmbianceFileSelect}
                      className="hidden"
                      id="ambianceAudioFileInput"
                      disabled={isProcessingAmbiance}
                    />
                    <label
                      htmlFor="ambianceAudioFileInput"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold cursor-pointer transition shadow-md"
                    >
                      {isProcessingAmbiance ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          <span>Traitement audio en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-indigo-300" />
                          <span>Uploader un fichier audio (.mp3, .ogg, .wav)</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Saisie URL manuelle */}
                  <div>
                    <input
                      type="text"
                      value={audioBackgroundUrl.startsWith("data:") ? "" : audioBackgroundUrl}
                      onChange={(e) => setAudioBackgroundUrl(e.target.value)}
                      placeholder={audioBackgroundUrl.startsWith("data:") ? "Piste audio téléversée prête" : "Ou coller une URL https://..."}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                    />
                  </div>
                </div>

                {/* Message d'état */}
                {ambianceStatusMessage && (
                  <div className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                    <span className="truncate">{ambianceStatusMessage}</span>
                  </div>
                )}

                {/* Lecteur de pré-écoute immédiat de la musique d'ambiance */}
                {audioBackgroundUrl && (
                  <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Pré-écoute de l&apos;ambiance sonore</span>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/30">
                        Ambiance prête
                      </span>
                    </div>
                    <audio
                      controls
                      src={audioBackgroundUrl}
                      className="w-full h-8 accent-indigo-500"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
              <Sparkles className="w-4 h-4 text-brand-accentLight shrink-0" />
              <span>
                <strong>Smart Interruption :</strong> dès qu&apos;une vidéo YouTube ou un podcast démarre, la musique se coupe instantanément en fondu. Elle reprend doucement dès que la vidéo s&apos;arrête.
              </span>
            </div>
          </div>

          {/* 6. CARTE MANIFESTE & BIO ÉDITORIALE */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/80">
              <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Titre du Manifeste & Charte Éditoriale (Section #bio)
                </h3>
                <p className="text-xs text-neutral-400">
                  Le titre mis en avant au-dessus de votre démarche journalistique.
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
                  Texte Détaillé du Manifeste (Optionnel si renseigné dans Hero)
                </label>
                <textarea
                  name="bioText"
                  rows={4}
                  defaultValue={settings.bioText || initialContent.bioText}
                  placeholder="Diplômée de l'Institut Français de Presse..."
                  className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 leading-relaxed placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale : Coordonnées & Réseaux */}
        <div className="lg:col-span-4 space-y-6">
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

          {/* Information synchro Neon */}
          <div className="p-5 rounded-3xl bg-brand-primary/40 border border-brand-accent/20 space-y-2 text-xs text-neutral-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-accentLight" />
              <span>Publication Instantanée</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Toutes les modifications enregistrées ici sont sauvegardées dans votre base Neon et visibles immédiatement sur le site vitrine sans redéploiement.
            </p>
          </div>
        </div>
      </div>

      {/* Bouton d'enregistrement général */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-800">
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition"
          >
            <ExternalLink className="w-4 h-4 text-brand-accent" />
            <span>Prévisualiser le site vitrine</span>
          </a>

          {state?.success && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Modifications sauvegardées avec succès</span>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving || isProcessingImage}
          id="save-website-content-btn"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs sm:text-sm font-bold shadow-xl shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enregistrement dans Neon en cours...</span>
            </>
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
