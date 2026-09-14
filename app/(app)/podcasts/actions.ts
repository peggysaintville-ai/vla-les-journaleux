"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PipelineStatus } from "@prisma/client";

// Types
export interface PodcastFormData {
  title: string;
  description?: string;
  coverImage?: string;
  rssFeedUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  isPublic?: boolean;
}

export interface EpisodeFormData {
  podcastId: string;
  title: string;
  description?: string;
  episodeNumber?: number;
  season?: number;
  pipelineStatus?: PipelineStatus;
  audioUrl?: string;
  audioStreamUrl?: string;
  duration?: number;
  recordDate?: string;
  scheduledReleaseDate?: string;
  showNotes?: string;
  transcript?: string;
  isVitrine?: boolean;
}

// 1. Actions Podcasts
export async function createPodcastAction(data: PodcastFormData) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Le titre de l'émission est obligatoire." };
    }

    const newPodcast = await db.podcast.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        coverImage: data.coverImage?.trim() || "/images/covers/voix-du-reel.jpg",
        rssFeedUrl: data.rssFeedUrl?.trim() || null,
        spotifyUrl: data.spotifyUrl?.trim() || null,
        appleUrl: data.appleUrl?.trim() || null,
        isPublic: data.isPublic ?? true,
      },
    });

    revalidatePath("/podcasts");
    return { success: true, podcast: newPodcast };
  } catch (error: any) {
    console.error("Erreur createPodcastAction:", error);
    return { success: false, error: "Impossible de créer le podcast." };
  }
}

export async function updatePodcastAction(id: string, data: Partial<PodcastFormData>) {
  try {
    if (!id) return { success: false, error: "ID de podcast manquant." };

    const updated = await db.podcast.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.coverImage !== undefined ? { coverImage: data.coverImage?.trim() || null } : {}),
        ...(data.rssFeedUrl !== undefined ? { rssFeedUrl: data.rssFeedUrl?.trim() || null } : {}),
        ...(data.spotifyUrl !== undefined ? { spotifyUrl: data.spotifyUrl?.trim() || null } : {}),
        ...(data.appleUrl !== undefined ? { appleUrl: data.appleUrl?.trim() || null } : {}),
        ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      },
    });

    revalidatePath("/podcasts");
    revalidatePath(`/podcasts/${id}`);
    return { success: true, podcast: updated };
  } catch (error: any) {
    console.error("Erreur updatePodcastAction:", error);
    return { success: false, error: "Impossible de modifier le podcast." };
  }
}

export async function deletePodcastAction(id: string) {
  try {
    if (!id) return { success: false, error: "ID de podcast manquant." };

    await db.podcast.delete({
      where: { id },
    });

    revalidatePath("/podcasts");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deletePodcastAction:", error);
    return { success: false, error: "Impossible de supprimer le podcast." };
  }
}

// 2. Actions Épisodes
export async function createEpisodeAction(data: EpisodeFormData) {
  try {
    if (!data.podcastId) return { success: false, error: "ID de podcast manquant." };
    if (!data.title?.trim()) return { success: false, error: "Le titre de l'épisode est obligatoire." };

    const created = await db.episode.create({
      data: {
        podcastId: data.podcastId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        episodeNumber: data.episodeNumber || 1,
        season: data.season || 1,
        pipelineStatus: data.pipelineStatus || PipelineStatus.IDEE,
        audioUrl: data.audioUrl?.trim() || null,
        audioStreamUrl: data.audioStreamUrl?.trim() || data.audioUrl?.trim() || null,
        duration: data.duration || null,
        recordDate: data.recordDate ? new Date(data.recordDate) : null,
        scheduledReleaseDate: data.scheduledReleaseDate ? new Date(data.scheduledReleaseDate) : null,
        showNotes: data.showNotes?.trim() || null,
        transcript: data.transcript?.trim() || null,
        isVitrine: data.isVitrine ?? false,
      },
    });

    revalidatePath(`/podcasts/${data.podcastId}`);
    revalidatePath("/podcasts");
    return { success: true, episode: created };
  } catch (error: any) {
    console.error("Erreur createEpisodeAction:", error);
    return { success: false, error: "Impossible de créer l'épisode." };
  }
}

export async function updateEpisodeStatusAction(id: string, podcastId: string, status: PipelineStatus) {
  try {
    const updated = await db.episode.update({
      where: { id },
      data: {
        pipelineStatus: status,
        ...(status === PipelineStatus.PUBLIE ? { publishedAt: new Date() } : {}),
      },
    });

    revalidatePath(`/podcasts/${podcastId}`);
    revalidatePath("/podcasts");
    return { success: true, episode: updated };
  } catch (error: any) {
    console.error("Erreur updateEpisodeStatusAction:", error);
    return { success: false, error: "Impossible de mettre à jour le statut." };
  }
}

export async function updateEpisodeAction(id: string, podcastId: string, data: Partial<EpisodeFormData>) {
  try {
    const updated = await db.episode.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.episodeNumber !== undefined ? { episodeNumber: data.episodeNumber } : {}),
        ...(data.season !== undefined ? { season: data.season } : {}),
        ...(data.pipelineStatus ? { pipelineStatus: data.pipelineStatus } : {}),
        ...(data.audioUrl !== undefined ? { audioUrl: data.audioUrl?.trim() || null } : {}),
        ...(data.audioStreamUrl !== undefined ? { audioStreamUrl: data.audioStreamUrl?.trim() || null } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.recordDate !== undefined ? { recordDate: data.recordDate ? new Date(data.recordDate) : null } : {}),
        ...(data.scheduledReleaseDate !== undefined ? { scheduledReleaseDate: data.scheduledReleaseDate ? new Date(data.scheduledReleaseDate) : null } : {}),
        ...(data.showNotes !== undefined ? { showNotes: data.showNotes?.trim() || null } : {}),
        ...(data.transcript !== undefined ? { transcript: data.transcript?.trim() || null } : {}),
        ...(data.isVitrine !== undefined ? { isVitrine: data.isVitrine } : {}),
      },
    });

    revalidatePath(`/podcasts/${podcastId}`);
    revalidatePath("/podcasts");
    return { success: true, episode: updated };
  } catch (error: any) {
    console.error("Erreur updateEpisodeAction:", error);
    return { success: false, error: "Impossible de modifier l'épisode." };
  }
}

export async function deleteEpisodeAction(id: string, podcastId: string) {
  try {
    await db.episode.delete({
      where: { id },
    });

    revalidatePath(`/podcasts/${podcastId}`);
    revalidatePath("/podcasts");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteEpisodeAction:", error);
    return { success: false, error: "Impossible de supprimer l'épisode." };
  }
}
