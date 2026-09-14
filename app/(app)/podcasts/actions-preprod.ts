"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { analyzeRawBrief, StructuredBriefResult, PlannedCalendarItem } from "@/lib/brief-analyzer";
import { updateWebsiteContent } from "@/lib/website-content";

export interface CreateProductionPayload {
  title: string;
  description: string;
  themes: string[];
  episodesCount: number;
  events: PlannedCalendarItem[];
  questions: string[];
  witnessProfiles: string[];
  deontologicalAlerts: string[];
  enableTeaser: boolean;
  teaserTitle?: string;
  teaserHook?: string;
  teaserBadge?: string;
  teaserLinkUrl?: string;
  teaserReleaseDate?: string | null;
}

export interface PreprodActionResult {
  success?: boolean;
  error?: string;
  podcastId?: string;
}

/**
 * Analyse un brief brut et extrait la structure éditoriale
 */
export async function analyzeBriefAction(
  rawText: string
): Promise<{ success: boolean; data?: StructuredBriefResult; error?: string }> {
  try {
    if (!rawText || rawText.trim().length < 10) {
      return {
        success: false,
        error: "Veuillez coller un texte de brief d'au moins quelques lignes.",
      };
    }
    const structured = analyzeRawBrief(rawText);
    return { success: true, data: structured };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de l'analyse du brief." };
  }
}

/**
 * Enregistre la production complète, les épisodes, les événements de planning et le teaser vitrine
 */
export async function createProductionFromBriefAction(
  payload: CreateProductionPayload
): Promise<PreprodActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  try {
    // 1. Création du Podcast
    const podcast = await db.podcast.create({
      data: {
        title: payload.title.trim() || "Nouvelle Série d'Investigation",
        description: payload.description.trim() || "Série documentaire audio indépendante.",
        coverImage: "/images/covers/voix-du-reel.jpg",
        isPublic: true,
        rssFeedUrl: "https://feeds.acast.com/public/shows/nouvelle-serie",
        spotifyUrl: "https://open.spotify.com/show/vlalesjournaleux",
        appleUrl: "https://podcasts.apple.com/fr/podcast/vlalesjournaleux",
      },
    });

    // 2. Création des Épisodes prévus
    const count = Math.max(1, Math.min(payload.episodesCount || 4, 12));
    const episodePromises = [];

    for (let i = 1; i <= count; i++) {
      episodePromises.push(
        db.episode.create({
          data: {
            podcastId: podcast.id,
            title: `Épisode ${i} : ${payload.title} (Partie ${i})`,
            description: `Volet ${i} de l'investigation. Axes thématiques : ${payload.themes.slice(0, 3).join(", ")}.`,
            episodeNumber: i,
            season: 1,
            pipelineStatus: i === 1 ? "ECRITURE" : "IDEE",
            duration: 2100, // ~35 minutes
            showNotes: `Sources et documentation de la série ${payload.title}.\nVigilance déontologique : ${payload.deontologicalAlerts.join(" | ")}`,
            transcript: "",
            authorId: user.userId,
          },
        })
      );
    }
    await Promise.all(episodePromises);

    // 3. Création des Événements du Planning dans CalendarEvent
    if (payload.events && payload.events.length > 0) {
      const eventPromises = payload.events.map((evt) => {
        const start = new Date(evt.startDate);
        const end = new Date(evt.endDate);
        return db.calendarEvent.create({
          data: {
            title: evt.title,
            description: evt.description || "",
            startDate: isNaN(start.getTime()) ? new Date() : start,
            endDate: isNaN(end.getTime()) ? new Date(Date.now() + 3600 * 1000) : end,
            eventType: evt.eventType || "TOURNAGE",
            location: evt.location || "Lieu d'enquête",
            allDay: false,
            userId: user.userId,
          },
        });
      });
      await Promise.all(eventPromises);
    }

    // 4. Création d'une Interview de cadrage avec questions & alertes déontologiques
    const formattedQuestions = (payload.questions || []).map((q, idx) => ({
      id: `q-${idx + 1}`,
      order: idx + 1,
      text: q,
      answered: false,
    }));

    const rundown = [
      {
        id: "block-1",
        order: 1,
        title: "1. Présentation & Accord d'enregistrement",
        durationMin: 3,
        status: "VALIDE",
        notes: "Rappel des objectifs d'enquête, accord parental si mineurs, consentement d'enregistrement sonore.",
        speaker: "Peggy SAINT-VILLE",
      },
      {
        id: "block-2",
        order: 2,
        title: "2. Témoignage vécu & Faits bruts",
        durationMin: 15,
        status: "EN_ATTENTE",
        notes: "Questions ouvertes sur les faits constatés, preuves matérielles et calendrier des événements.",
        speaker: "Témoin & Journaliste",
      },
      {
        id: "block-3",
        order: 3,
        title: "3. Analyse contradictoire & Droit de réponse",
        durationMin: 12,
        status: "EN_ATTENTE",
        notes: "Confrontation avec les réponses des autorités ou entreprises concernées.",
        speaker: "Témoin & Journaliste",
      },
    ];

    await db.interview.create({
      data: {
        title: `Cadrage Terrain : ${payload.title}`,
        status: "PREPARATION",
        shootingDate: payload.events[0]?.startDate ? new Date(payload.events[0].startDate) : new Date(),
        location: payload.events[0]?.location || "Terrain / Studio",
        notes: `Témoins ciblés :\n- ${payload.witnessProfiles.join("\n- ")}\n\nVigilance déontologique :\n- ${payload.deontologicalAlerts.join("\n- ")}`,
        deliverables: `Série ${count} épisodes de 35 min`,
        questions: formattedQuestions,
        rundown: rundown,
        assigneeId: user.userId,
      },
    });

    // 5. Activation du Teasing Vitrine si coché
    if (payload.enableTeaser) {
      await updateWebsiteContent({
        teaserEnabled: true,
        teaserTitle: payload.teaserTitle || payload.title,
        teaserHook: payload.teaserHook || payload.description,
        teaserBadge: payload.teaserBadge || "Bientôt disponible",
        teaserLinkUrl: payload.teaserLinkUrl || "https://instagram.com/vlalesjournaleux",
        teaserLinkLabel: "Voir l'annonce officielle",
        teaserReleaseDate: payload.teaserReleaseDate ? new Date(payload.teaserReleaseDate) : null,
      });
    }

    revalidatePath("/podcasts");
    revalidatePath("/interviews");
    revalidatePath("/planning");
    revalidatePath("/dashboard");
    revalidatePath("/site-vitrine");
    revalidatePath("/");

    return { success: true, podcastId: podcast.id };
  } catch (err: any) {
    console.error("Erreur createProductionFromBriefAction :", err);
    return { error: err.message || "Erreur lors de la création de la production." };
  }
}

/**
 * Active ou désactive le teaser vitrine en 1 clic
 */
export async function toggleTeaserAction(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateWebsiteContent({
      teaserEnabled: enabled,
    });
    revalidatePath("/dashboard");
    revalidatePath("/site-vitrine");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur activation teaser." };
  }
}
