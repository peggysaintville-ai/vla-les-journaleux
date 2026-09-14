"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mic2,
  Plus,
  Radio,
  PlayCircle,
  Sparkles,
  Search,
  Rss,
  ExternalLink,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  Music,
  Globe,
  X,
  AlertCircle,
} from "lucide-react";
import {
  createPodcastAction,
  updatePodcastAction,
  deletePodcastAction,
  PodcastFormData,
} from "@/app/(app)/podcasts/actions";
import PreprodBriefModal from "@/components/preprod-brief-modal";

interface PodcastItem {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  rssFeedUrl: string | null;
  spotifyUrl: string | null;
  appleUrl: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  episodes: {
    id: string;
    pipelineStatus: string;
    duration: number | null;
  }[];
}

interface PodcastsListClientProps {
  initialPodcasts: PodcastItem[];
}

export default function PodcastsListClient({ initialPodcasts }: PodcastsListClientProps) {
  const [podcasts, setPodcasts] = useState<PodcastItem[]>(initialPodcasts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreprodModalOpen, setIsPreprodModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<PodcastItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [rssFeedUrl, setRssFeedUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [appleUrl, setAppleUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const openCreateModal = () => {
    setEditingPodcast(null);
    setTitle("");
    setDescription("");
    setCoverImage("/images/covers/voix-du-reel.jpg");
    setRssFeedUrl("");
    setSpotifyUrl("");
    setAppleUrl("");
    setIsPublic(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PodcastItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPodcast(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setCoverImage(p.coverImage || "/images/covers/voix-du-reel.jpg");
    setRssFeedUrl(p.rssFeedUrl || "");
    setSpotifyUrl(p.spotifyUrl || "");
    setAppleUrl(p.appleUrl || "");
    setIsPublic(p.isPublic);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeletePodcast = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce podcast et tous ses épisodes associés ?")) {
      return;
    }

    startTransition(async () => {
      const res = await deletePodcastAction(id);
      if (res.success) {
        setPodcasts((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(res.error || "Erreur lors de la suppression");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Le titre de l'émission est obligatoire.");
      return;
    }

    startTransition(async () => {
      const payload: PodcastFormData = {
        title,
        description,
        coverImage,
        rssFeedUrl,
        spotifyUrl,
        appleUrl,
        isPublic,
      };

      if (editingPodcast) {
        const res = await updatePodcastAction(editingPodcast.id, payload);
        if (res.success && res.podcast) {
          setPodcasts((prev) =>
            prev.map((p) =>
              p.id === editingPodcast.id
                ? { ...p, ...res.podcast, episodes: p.episodes }
                : p
            )
          );
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Erreur lors de la modification");
        }
      } else {
        const res = await createPodcastAction(payload);
        if (res.success && res.podcast) {
          setPodcasts((prev) => [{ ...res.podcast, episodes: [] } as PodcastItem, ...prev]);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Erreur lors de la création");
        }
      }
    });
  };

  const filteredPodcasts = podcasts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistiques
  const totalEpisodes = podcasts.reduce((acc, p) => acc + p.episodes.length, 0);
  const totalPublished = podcasts.reduce(
    (acc, p) => acc + p.episodes.filter((e) => e.pipelineStatus === "PUBLIE").length,
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Podcasts & Séries Documentaires
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Production, habillage sonore et diffusion multi-plateformes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsPreprodModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream hover:text-white border border-brand-accent/40 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-accentLight" />
            <span>Préparer une production depuis un brief</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            id="create-podcast-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau podcast</span>
          </button>
        </div>
      </div>

      {/* 2. Barre d'indicateurs rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Émissions actives</div>
            <div className="text-xl font-bold text-white mt-0.5">{podcasts.length} émission{podcasts.length > 1 ? "s" : ""}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Épisodes en production / publiés</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalEpisodes} (dont {totalPublished} publiés)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400">Flux RSS & Plateformes</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">Synchronisé</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Filtres & Recherche */}
      <div className="flex items-center justify-between gap-4 p-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une émission..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>
        <div className="text-xs text-neutral-400">
          {filteredPodcasts.length} émission{filteredPodcasts.length > 1 ? "s" : ""} trouvée{filteredPodcasts.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* 4. Grille des Podcasts ou État Vide */}
      {filteredPodcasts.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
            <Mic2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Aucun podcast trouvé</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Créez votre première série documentaire ou modifiez vos critères de recherche.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold transition shadow-lg shadow-brand-accent/20"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une émission</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPodcasts.map((podcast) => {
            const publishedCount = podcast.episodes.filter((e) => e.pipelineStatus === "PUBLIE").length;
            const inProgressCount = podcast.episodes.length - publishedCount;

            return (
              <div
                key={podcast.id}
                className="group relative bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-brand-accent/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg shadow-black/40 hover:shadow-brand-accent/5"
              >
                {/* Image de couverture avec overlay */}
                <div className="relative h-44 w-full bg-brand-secondary overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-10" />
                  
                  {podcast.coverImage ? (
                    <img
                      src={podcast.coverImage}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-primary text-brand-accent/50">
                      <Radio className="w-16 h-16" />
                    </div>
                  )}

                  {/* Badge statut visibilité */}
                  <div className="absolute top-3 left-3 z-20">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${
                        podcast.isPublic
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-neutral-800/80 text-neutral-300 border-neutral-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          podcast.isPublic ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"
                        }`}
                      />
                      {podcast.isPublic ? "Vitrine active" : "Brouillon privé"}
                    </span>
                  </div>

                  {/* Actions contextuelles rapides */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(podcast, e)}
                      className="p-2 rounded-xl bg-neutral-900/90 hover:bg-brand-primary text-neutral-300 hover:text-white border border-neutral-700 transition"
                      title="Modifier les réglages"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePodcast(podcast.id, e)}
                      className="p-2 rounded-xl bg-neutral-900/90 hover:bg-rose-950/80 text-rose-400 border border-neutral-700 hover:border-rose-800 transition"
                      title="Supprimer la série"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contenu et Métadonnées */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-brand-accent transition-colors tracking-tight line-clamp-1">
                      {podcast.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {podcast.description || "Aucune description renseignée pour cette émission."}
                    </p>
                  </div>

                  {/* Liens plateformes / flux */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                    {podcast.rssFeedUrl && (
                      <span className="inline-flex items-center gap-1 text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        <Rss className="w-3 h-3" />
                        <span>RSS</span>
                      </span>
                    )}
                    {podcast.spotifyUrl && (
                      <span className="inline-flex items-center gap-1 text-emerald-400/90 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                        <Music className="w-3 h-3" />
                        <span>Spotify</span>
                      </span>
                    )}
                    {podcast.appleUrl && (
                      <span className="inline-flex items-center gap-1 text-purple-400/90 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                        <Radio className="w-3 h-3" />
                        <span>Apple</span>
                      </span>
                    )}
                  </div>

                  {/* Compteur d'épisodes & CTA */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-bold text-white">{podcast.episodes.length}</span>{" "}
                      <span className="text-neutral-400">
                        épisode{podcast.episodes.length > 1 ? "s" : ""}
                      </span>
                      {inProgressCount > 0 && (
                        <span className="text-amber-400 text-[11px] ml-1.5 font-medium">
                          ({inProgressCount} en cours)
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/podcasts/${podcast.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-secondary border border-brand-accent/30 text-brand-cream text-xs font-semibold transition group-hover:border-brand-accent"
                    >
                      <span>Gérer les épisodes</span>
                      <PlayCircle className="w-3.5 h-3.5 text-brand-accent" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modale de Création / Modification de Podcast */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center">
                  <Mic2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingPodcast ? "Modifier l'émission" : "Nouveau Podcast"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Configuration des flux de syndication et visibilité
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
                  Titre de la série documentaire *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Les Voix du Réel, Secrets d'État..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Description éditoriale
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Pitch de l'émission, axes d'investigation abordés..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Image de jaquette (URL ou chemin relatif)
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="/images/covers/voix-du-reel.jpg ou URL externe"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Flux RSS Podcast
                  </label>
                  <input
                    type="url"
                    value={rssFeedUrl}
                    onChange={(e) => setRssFeedUrl(e.target.value)}
                    placeholder="https://feeds.acast.com/..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Lien Spotify
                  </label>
                  <input
                    type="url"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/show/..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Lien Apple Podcasts
                </label>
                <input
                  type="url"
                  value={appleUrl}
                  onChange={(e) => setAppleUrl(e.target.value)}
                  placeholder="https://podcasts.apple.com/..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublicCheck"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-brand-accent focus:ring-brand-accent accent-brand-accent"
                />
                <label htmlFor="isPublicCheck" className="text-xs font-medium text-neutral-200 cursor-pointer">
                  Diffuser cette émission sur le site vitrine public
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
                  {isPending ? "Enregistrement..." : editingPodcast ? "Mettre à jour" : "Créer le podcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modale Assistant de Pré-production */}
      <PreprodBriefModal
        isOpen={isPreprodModalOpen}
        onClose={() => setIsPreprodModalOpen(false)}
      />
    </div>
  );
}
