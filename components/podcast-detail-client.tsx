"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Mic2,
  Plus,
  ArrowLeft,
  Calendar,
  Clock,
  Radio,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  Globe,
  FileText,
  Headphones,
  Music,
  ExternalLink,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";
import { PipelineStatus } from "@prisma/client";
import {
  createEpisodeAction,
  updateEpisodeStatusAction,
  updateEpisodeAction,
  deleteEpisodeAction,
  EpisodeFormData,
} from "@/app/(app)/podcasts/actions";
import { useAudioPlayer } from "@/lib/audio-player-context";
import MediaEmbed from "@/components/media-embed";

// Définition des colonnes du pipeline
const PIPELINE_COLUMNS: {
  status: PipelineStatus;
  label: string;
  color: string;
  badgeBg: string;
}[] = [
  {
    status: PipelineStatus.IDEE,
    label: "Idée",
    color: "text-amber-400 border-amber-400/30",
    badgeBg: "bg-amber-400/10",
  },
  {
    status: PipelineStatus.ECRITURE,
    label: "Écriture",
    color: "text-sky-400 border-sky-400/30",
    badgeBg: "bg-sky-400/10",
  },
  {
    status: PipelineStatus.ENREGISTRE,
    label: "Enregistré",
    color: "text-indigo-400 border-indigo-400/30",
    badgeBg: "bg-indigo-400/10",
  },
  {
    status: PipelineStatus.MONTAGE,
    label: "Montage",
    color: "text-purple-400 border-purple-400/30",
    badgeBg: "bg-purple-400/10",
  },
  {
    status: PipelineStatus.VALIDATION,
    label: "Prêt / Validation",
    color: "text-orange-400 border-orange-400/30",
    badgeBg: "bg-orange-400/10",
  },
  {
    status: PipelineStatus.PUBLIE,
    label: "Publié",
    color: "text-emerald-400 border-emerald-400/30",
    badgeBg: "bg-emerald-400/10",
  },
];

interface EpisodeItem {
  id: string;
  podcastId: string;
  title: string;
  description: string | null;
  episodeNumber: number | null;
  season: number | null;
  pipelineStatus: PipelineStatus;
  audioUrl: string | null;
  audioStreamUrl: string | null;
  duration: number | null;
  recordDate: Date | null;
  scheduledReleaseDate: Date | null;
  showNotes: string | null;
  transcript: string | null;
  isVitrine: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface PodcastDetailProps {
  podcast: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    rssFeedUrl: string | null;
    spotifyUrl: string | null;
    appleUrl: string | null;
    videoUrl?: string | null;
    audioEmbedUrl?: string | null;
    isPublic: boolean;
  };
  initialEpisodes: EpisodeItem[];
}

export default function PodcastDetailClient({
  podcast,
  initialEpisodes,
}: PodcastDetailProps) {
  const [episodes, setEpisodes] = useState<EpisodeItem[]>(initialEpisodes);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<EpisodeItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Audio Player Context
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [season, setSeason] = useState<number>(1);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>(PipelineStatus.IDEE);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStreamUrl, setAudioStreamUrl] = useState("");
  const [durationSec, setDurationSec] = useState<number>(0);
  const [recordDate, setRecordDate] = useState("");
  const [scheduledReleaseDate, setScheduledReleaseDate] = useState("");
  const [showNotes, setShowNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isVitrine, setIsVitrine] = useState(false);

  const openCreateModal = () => {
    setEditingEpisode(null);
    setTitle("");
    setDescription("");
    const maxEp = episodes.reduce((max, ep) => Math.max(max, ep.episodeNumber || 0), 0);
    setEpisodeNumber(maxEp + 1);
    setSeason(1);
    setPipelineStatus(PipelineStatus.IDEE);
    setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    setAudioStreamUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    setDurationSec(1800);
    setRecordDate("");
    setScheduledReleaseDate("");
    setShowNotes("");
    setTranscript("");
    setIsVitrine(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ep: EpisodeItem) => {
    setEditingEpisode(ep);
    setTitle(ep.title);
    setDescription(ep.description || "");
    setEpisodeNumber(ep.episodeNumber || 1);
    setSeason(ep.season || 1);
    setPipelineStatus(ep.pipelineStatus);
    setAudioUrl(ep.audioUrl || "");
    setAudioStreamUrl(ep.audioStreamUrl || ep.audioUrl || "");
    setDurationSec(ep.duration || 0);
    setRecordDate(ep.recordDate ? new Date(ep.recordDate).toISOString().split("T")[0] : "");
    setScheduledReleaseDate(ep.scheduledReleaseDate ? new Date(ep.scheduledReleaseDate).toISOString().split("T")[0] : "");
    setShowNotes(ep.showNotes || "");
    setTranscript(ep.transcript || "");
    setIsVitrine(ep.isVitrine);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (episodeId: string, newStatus: PipelineStatus) => {
    startTransition(async () => {
      // Optimistic update
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.id === episodeId ? { ...ep, pipelineStatus: newStatus } : ep
        )
      );

      const res = await updateEpisodeStatusAction(episodeId, podcast.id, newStatus);
      if (!res.success) {
        alert(res.error || "Erreur mise à jour statut");
      }
    });
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet épisode ?")) return;

    startTransition(async () => {
      const res = await deleteEpisodeAction(id, podcast.id);
      if (res.success) {
        setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
      } else {
        alert(res.error || "Erreur suppression");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Le titre de l'épisode est obligatoire.");
      return;
    }

    startTransition(async () => {
      const payload: EpisodeFormData = {
        podcastId: podcast.id,
        title,
        description,
        episodeNumber,
        season,
        pipelineStatus,
        audioUrl,
        audioStreamUrl: audioStreamUrl || audioUrl,
        duration: durationSec,
        recordDate: recordDate || undefined,
        scheduledReleaseDate: scheduledReleaseDate || undefined,
        showNotes,
        transcript,
        isVitrine,
      };

      if (editingEpisode) {
        const res = await updateEpisodeAction(editingEpisode.id, podcast.id, payload);
        if (res.success && res.episode) {
          setEpisodes((prev) =>
            prev.map((ep) => (ep.id === editingEpisode.id ? (res.episode as unknown as EpisodeItem) : ep))
          );
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Erreur modification");
        }
      } else {
        const res = await createEpisodeAction(payload);
        if (res.success && res.episode) {
          setEpisodes((prev) => [res.episode as unknown as EpisodeItem, ...prev]);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Erreur création");
        }
      }
    });
  };

  // Helper lecture audio
  const handlePlayAudio = (ep: EpisodeItem) => {
    const stream = ep.audioStreamUrl || ep.audioUrl;
    if (!stream) {
      alert("Aucun fichier audio associé à cet épisode.");
      return;
    }

    playTrack({
      id: ep.id,
      title: ep.title,
      podcastTitle: podcast.title,
      audioUrl: stream,
      duration: ep.duration,
    });
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Métriques
  const publishedEpisodes = episodes.filter((e) => e.pipelineStatus === PipelineStatus.PUBLIE);
  const totalDurationSeconds = episodes.reduce((acc, ep) => acc + (ep.duration || 0), 0);
  const totalHours = (totalDurationSeconds / 3600).toFixed(1);

  const filteredEpisodes = episodes.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Bouton Retour & Fil d'Ariane */}
      <div className="flex items-center gap-3">
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Toutes les séries</span>
        </Link>
        <span className="text-neutral-600">/</span>
        <span className="text-xs font-bold text-brand-accent tracking-wide uppercase">
          {podcast.title}
        </span>
      </div>

      {/* 2. En-tête de l'Émission & Métriques */}
      <div className="relative bg-gradient-to-r from-brand-secondary via-neutral-900 to-brand-primary/40 border border-brand-accent/20 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-primary border border-brand-accent/30 overflow-hidden shadow-xl flex-shrink-0">
              {podcast.coverImage ? (
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-accent">
                  <Radio className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {podcast.title}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    podcast.isPublic
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      podcast.isPublic ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                    }`}
                  />
                  {podcast.isPublic ? "Vitrine active" : "Privé"}
                </span>
              </div>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                {podcast.description || "Aucune description éditoriale."}
              </p>
            </div>
          </div>

          {/* Bouton Nouvel Épisode */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={openCreateModal}
              id="new-episode-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un épisode</span>
            </button>
          </div>
        </div>

        {/* Barre de métriques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/80">
          <div>
            <div className="text-[11px] text-neutral-400">Total épisodes</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {episodes.length} épisode{episodes.length > 1 ? "s" : ""}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Épisodes publiés</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {publishedEpisodes.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Durée audio cumulée</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {totalHours} h de rush
            </div>
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">Visibilité vitrine</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {episodes.filter((e) => e.isVitrine).length} en vedette
            </div>
          </div>
        </div>

        {/* Lecteurs Multimédias Associés au Podcast */}
        {(podcast.videoUrl || podcast.audioEmbedUrl) && (
          <div className="mt-6 pt-6 border-t border-neutral-800/80">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-accentLight" />
              <span>Lecteurs Multimédias Associés à la Série</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {podcast.videoUrl && (
                <MediaEmbed url={podcast.videoUrl} title={`Vidéo : ${podcast.title}`} />
              )}
              {podcast.audioEmbedUrl && (
                <MediaEmbed url={podcast.audioEmbedUrl} title={`Flux Audio : ${podcast.title}`} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Filtres, Recherche & Mode de Vue (Kanban / Tableau) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par titre, mots-clés..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-brand-primary text-brand-cream border border-brand-accent/40"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-brand-primary text-brand-cream border border-brand-accent/40"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Vue Liste
            </button>
          </div>
        </div>
      </div>

      {/* 4. PIPELINE KANBAN (Colonnes par statut) */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const colEpisodes = filteredEpisodes.filter(
              (e) => e.pipelineStatus === col.status
            );

            return (
              <div
                key={col.status}
                className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-3 flex flex-col min-w-[220px]"
              >
                {/* En-tête de la colonne */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.badgeBg} border ${col.color}`} />
                    <span className="text-xs font-bold text-white">{col.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">
                    {colEpisodes.length}
                  </span>
                </div>

                {/* Cartes Épisodes de la colonne */}
                <div className="space-y-3 flex-1">
                  {colEpisodes.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-neutral-800/60 text-center text-[11px] text-neutral-500 italic">
                      Aucun épisode
                    </div>
                  ) : (
                    colEpisodes.map((ep) => {
                      const isThisPlaying =
                        currentTrack?.id === ep.id && isPlaying;

                      return (
                        <div
                          key={ep.id}
                          className="group bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-brand-accent/40 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-md shadow-black/20"
                        >
                          {/* Numéro et Badge vitrine */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-400 font-semibold">
                              S{ep.season || 1} • E{ep.episodeNumber || 1}
                            </span>
                            {ep.isVitrine && (
                              <span
                                className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20"
                                title="Affiché sur le site vitrine"
                              >
                                <Globe className="w-2.5 h-2.5" />
                                <span>Vitrine</span>
                              </span>
                            )}
                          </div>

                          {/* Titre */}
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
                            {ep.title}
                          </h4>

                          {/* Mini-lecteur interactif si audio dispo */}
                          {(ep.audioStreamUrl || ep.audioUrl) && (
                            <div className="pt-1 flex items-center justify-between bg-neutral-950/80 p-2 rounded-xl border border-neutral-800/80">
                              <button
                                onClick={() => handlePlayAudio(ep)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                                  isThisPlaying
                                    ? "bg-brand-accent text-white shadow-md shadow-brand-accent/40"
                                    : "bg-brand-primary text-brand-cream hover:bg-brand-secondary border border-brand-accent/30"
                                }`}
                                title={isThisPlaying ? "Mettre en pause" : "Écouter l'épisode"}
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                              <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                                <Clock className="w-3 h-3 text-neutral-500" />
                                <span>{formatDuration(ep.duration)}</span>
                              </div>
                            </div>
                          )}

                          {/* Sélecteur de statut rapide */}
                          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                            <select
                              value={ep.pipelineStatus}
                              onChange={(e) =>
                                handleStatusChange(ep.id, e.target.value as PipelineStatus)
                              }
                              className="text-[10px] bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-neutral-300 font-medium focus:outline-none focus:ring-1 focus:ring-brand-accent"
                            >
                              {PIPELINE_COLUMNS.map((c) => (
                                <option key={c.status} value={c.status}>
                                  {c.label}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(ep)}
                                className="p-1 text-neutral-400 hover:text-white transition"
                                title="Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteEpisode(ep.id)}
                                className="p-1 text-neutral-400 hover:text-rose-400 transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. VUE TABLEAU LISTE */
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Épisode</th>
                  <th className="py-3 px-4">Titre & Show Notes</th>
                  <th className="py-3 px-4">Audio & Écoute</th>
                  <th className="py-3 px-4">Statut Pipeline</th>
                  <th className="py-3 px-4">Vitrine</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredEpisodes.map((ep) => {
                  const isThisPlaying = currentTrack?.id === ep.id && isPlaying;

                  return (
                    <tr key={ep.id} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        S{ep.season || 1} • E{ep.episodeNumber || 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ep.title}</div>
                        {ep.description && (
                          <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {ep.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {ep.audioStreamUrl || ep.audioUrl ? (
                          <button
                            onClick={() => handlePlayAudio(ep)}
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                              isThisPlaying
                                ? "bg-brand-accent text-white"
                                : "bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800"
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                            <span className="font-mono text-[11px]">
                              {formatDuration(ep.duration)}
                            </span>
                          </button>
                        ) : (
                          <span className="text-neutral-500 italic text-[11px]">
                            Aucun audio
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ep.pipelineStatus}
                          onChange={(e) =>
                            handleStatusChange(ep.id, e.target.value as PipelineStatus)
                          }
                          className="text-xs bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-neutral-200 font-medium focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        >
                          {PIPELINE_COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            ep.isVitrine
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-neutral-800/60 text-neutral-400"
                          }`}
                        >
                          {ep.isVitrine ? "Visible" : "Non"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(ep)}
                            className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(ep.id)}
                            className="p-1.5 rounded-lg bg-neutral-950 hover:bg-rose-950 text-rose-400 border border-neutral-800 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODALE D'AJOUT / ÉDITION D'ÉPISODE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingEpisode ? "Modifier l'épisode" : "Nouvel Épisode"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Série : <strong className="text-brand-accent">{podcast.title}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Titre de l'épisode *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Épisode 3 : Les coulisses du marché noir des armes légères"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Numéro Épisode
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Saison
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={season}
                    onChange={(e) => setSeason(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Statut initial
                  </label>
                  <select
                    value={pipelineStatus}
                    onChange={(e) => setPipelineStatus(e.target.value as PipelineStatus)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  >
                    {PIPELINE_COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Synopsis / Résumé court
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Accroche, angle traité et invités phares..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />
              </div>

              {/* Fichier Audio Stream */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Lien audio / flux d'écoute direct (MP3 / WAV)
                  </label>
                  <input
                    type="url"
                    value={audioStreamUrl}
                    onChange={(e) => setAudioStreamUrl(e.target.value)}
                    placeholder="https://audio.local/... ou URL CDN"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Durée estimée (secondes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={durationSec}
                    onChange={(e) => setDurationSec(parseInt(e.target.value) || 0)}
                    placeholder="Ex. 2700 pour 45 min"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Date d'enregistrement studio
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Date de diffusion prévue
                  </label>
                  <input
                    type="date"
                    value={scheduledReleaseDate}
                    onChange={(e) => setScheduledReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              {/* Show Notes & Transcript */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Notes d'émission (Show notes)
                  </label>
                  <textarea
                    value={showNotes}
                    onChange={(e) => setShowNotes(e.target.value)}
                    rows={3}
                    placeholder="Sources citées, liens, remerciements..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Retranscription (Transcript audio)
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={3}
                    placeholder="Retranscription textuelle intégrale..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                  />
                </div>
              </div>

              {/* Switch Vitrine */}
              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isVitrineCheck"
                  checked={isVitrine}
                  onChange={(e) => setIsVitrine(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-brand-accent focus:ring-brand-accent accent-brand-accent"
                />
                <label htmlFor="isVitrineCheck" className="text-xs font-medium text-neutral-200 cursor-pointer">
                  Afficher cet épisode sur le site vitrine public (page d'accueil / lecteur vitrine)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-md shadow-brand-accent/20 disabled:opacity-50"
                >
                  {isPending ? "Enregistrement..." : editingEpisode ? "Mettre à jour" : "Créer l'épisode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
