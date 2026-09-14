import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export interface WebsiteContentData {
  id?: string;
  heroTitle: string;
  heroSubtitle: string;
  bioText: string;
  contactEmail: string;
  socialSpotify?: string | null;
  socialApple?: string | null;
  socialYoutube?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
  featuredPodcastId?: string | null;
  teaserEnabled: boolean;
  teaserBadge?: string | null;
  teaserTitle?: string | null;
  teaserHook?: string | null;
  teaserLinkUrl?: string | null;
  teaserLinkLabel?: string | null;
  teaserReleaseDate?: Date | string | null;
  videoUrl?: string | null;
  audioEmbedUrl?: string | null;
  updatedAt?: Date;
}

const DEFAULT_CONTENT: WebsiteContentData = {
  id: "cms-default-1",
  heroTitle: "Révéler le réel par la rigueur de l'enquête et la puissance du sonore.",
  heroSubtitle:
    "Depuis plus de 10 ans, je conçois des podcasts documentaires, mène des investigations de long cours et anime les grands débats contemporains avec une exigence absolue d'indépendance et de narration.",
  bioText: `Diplômée de l'Institut Français de Presse et passée par les rédactions de radio publique, j'ai forgé ma pratique journalistique au contact direct du terrain.

Mon travail s'articule autour de l'investigation sociale, des mutations économiques, des bouleversements technologiques et de la géopolitique des ressources. L'audio permet une intimité et une authenticité rares : il restitue l'hésitation, la vérité d'une voix humaine et l'atmosphère brute d'un lieu d'enquête.

Membre de collectifs internationaux de journalistes d'investigation, je mène chaque projet dans le strict respect de la déontologie et de la protection des sources.`,
  contactEmail: "peggy.saintville@gmail.com",
  socialSpotify: "https://open.spotify.com/show/vlalesjournaleux",
  socialApple: "https://podcasts.apple.com/fr/podcast/vlalesjournaleux",
  socialYoutube: "https://youtube.com/@vlalesjournaleux",
  socialTwitter: "https://x.com/vlalesjournaleux",
  socialLinkedin: "https://linkedin.com/in/peggy-saint-ville",
  socialInstagram: "https://instagram.com/vlalesjournaleux",
  featuredPodcastId: null,
  teaserEnabled: false,
  teaserBadge: "Bientôt disponible",
  teaserTitle: "Enquête exclusive : Scandales des marchés publics",
  teaserHook: "Une série d'investigation audio en 4 volets pour mettre en lumière les coulisses des financements.",
  teaserLinkUrl: "https://instagram.com/vlalesjournaleux",
  teaserLinkLabel: "Voir l'annonce officielle",
  teaserReleaseDate: null,
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  audioEmbedUrl: "https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5",
  updatedAt: new Date(),
};

const JSON_FILE_PATH = path.join(process.cwd(), "lib", "website-content.json");

function readLocalJson(): WebsiteContentData {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(JSON_FILE_PATH, "utf-8"));
      return { ...DEFAULT_CONTENT, ...data };
    }
  } catch (e) {
    console.warn("Erreur lecture JSON local website-content :", e);
  }
  return DEFAULT_CONTENT;
}

function writeLocalJson(data: WebsiteContentData): void {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Erreur écriture JSON local website-content :", e);
  }
}

/**
 * Récupère le contenu CMS du site vitrine avec persistance locale et fallback sécurisé
 */
export async function getWebsiteContent(): Promise<WebsiteContentData> {
  try {
    const content = await db.websiteContent.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (content) {
      return {
        id: content.id,
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        bioText: content.bioText,
        contactEmail: content.contactEmail,
        socialSpotify: content.socialSpotify,
        socialApple: content.socialApple,
        socialYoutube: content.socialYoutube,
        socialTwitter: content.socialTwitter,
        socialLinkedin: content.socialLinkedin,
        socialInstagram: content.socialInstagram,
        featuredPodcastId: content.featuredPodcastId,
        teaserEnabled: content.teaserEnabled ?? false,
        teaserBadge: content.teaserBadge || "Bientôt disponible",
        teaserTitle: content.teaserTitle,
        teaserHook: content.teaserHook,
        teaserLinkUrl: content.teaserLinkUrl,
        teaserLinkLabel: content.teaserLinkLabel || "Voir l'annonce officielle",
        teaserReleaseDate: content.teaserReleaseDate,
        videoUrl: content.videoUrl ?? DEFAULT_CONTENT.videoUrl,
        audioEmbedUrl: content.audioEmbedUrl ?? DEFAULT_CONTENT.audioEmbedUrl,
        updatedAt: content.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour WebsiteContent, utilisation du fallback fichier :", err);
  }

  return readLocalJson();
}

/**
 * Met à jour le contenu CMS du site vitrine
 */
export async function updateWebsiteContent(
  data: Partial<WebsiteContentData>
): Promise<WebsiteContentData> {
  let result: WebsiteContentData = {
    ...readLocalJson(),
    ...data,
    updatedAt: new Date(),
  };

  try {
    const existing = await db.websiteContent.findFirst();
    if (existing) {
      const updated = await db.websiteContent.update({
        where: { id: existing.id },
        data: {
          heroTitle: data.heroTitle ?? existing.heroTitle,
          heroSubtitle: data.heroSubtitle ?? existing.heroSubtitle,
          bioText: data.bioText ?? existing.bioText,
          contactEmail: data.contactEmail ?? existing.contactEmail,
          socialSpotify: data.socialSpotify !== undefined ? data.socialSpotify : existing.socialSpotify,
          socialApple: data.socialApple !== undefined ? data.socialApple : existing.socialApple,
          socialYoutube: data.socialYoutube !== undefined ? data.socialYoutube : existing.socialYoutube,
          socialTwitter: data.socialTwitter !== undefined ? data.socialTwitter : existing.socialTwitter,
          socialLinkedin: data.socialLinkedin !== undefined ? data.socialLinkedin : existing.socialLinkedin,
          socialInstagram: data.socialInstagram !== undefined ? data.socialInstagram : existing.socialInstagram,
          featuredPodcastId:
            data.featuredPodcastId !== undefined ? data.featuredPodcastId : existing.featuredPodcastId,
          teaserEnabled: data.teaserEnabled !== undefined ? data.teaserEnabled : existing.teaserEnabled,
          teaserBadge: data.teaserBadge !== undefined ? data.teaserBadge : existing.teaserBadge,
          teaserTitle: data.teaserTitle !== undefined ? data.teaserTitle : existing.teaserTitle,
          teaserHook: data.teaserHook !== undefined ? data.teaserHook : existing.teaserHook,
          teaserLinkUrl: data.teaserLinkUrl !== undefined ? data.teaserLinkUrl : existing.teaserLinkUrl,
          teaserLinkLabel: data.teaserLinkLabel !== undefined ? data.teaserLinkLabel : existing.teaserLinkLabel,
          teaserReleaseDate:
            data.teaserReleaseDate !== undefined
              ? data.teaserReleaseDate
                ? new Date(data.teaserReleaseDate)
                : null
              : existing.teaserReleaseDate,
          videoUrl: data.videoUrl !== undefined ? data.videoUrl : existing.videoUrl,
          audioEmbedUrl: data.audioEmbedUrl !== undefined ? data.audioEmbedUrl : existing.audioEmbedUrl,
        },
      });
      result = {
        id: updated.id,
        heroTitle: updated.heroTitle,
        heroSubtitle: updated.heroSubtitle,
        bioText: updated.bioText,
        contactEmail: updated.contactEmail,
        socialSpotify: updated.socialSpotify,
        socialApple: updated.socialApple,
        socialYoutube: updated.socialYoutube,
        socialTwitter: updated.socialTwitter,
        socialLinkedin: updated.socialLinkedin,
        socialInstagram: updated.socialInstagram,
        featuredPodcastId: updated.featuredPodcastId,
        teaserEnabled: updated.teaserEnabled,
        teaserBadge: updated.teaserBadge,
        teaserTitle: updated.teaserTitle,
        teaserHook: updated.teaserHook,
        teaserLinkUrl: updated.teaserLinkUrl,
        teaserLinkLabel: updated.teaserLinkLabel,
        teaserReleaseDate: updated.teaserReleaseDate,
        videoUrl: updated.videoUrl,
        audioEmbedUrl: updated.audioEmbedUrl,
        updatedAt: updated.updatedAt,
      };
    } else {
      const created = await db.websiteContent.create({
        data: {
          heroTitle: data.heroTitle || DEFAULT_CONTENT.heroTitle,
          heroSubtitle: data.heroSubtitle || DEFAULT_CONTENT.heroSubtitle,
          bioText: data.bioText || DEFAULT_CONTENT.bioText,
          contactEmail: data.contactEmail || DEFAULT_CONTENT.contactEmail,
          socialSpotify: data.socialSpotify || DEFAULT_CONTENT.socialSpotify,
          socialApple: data.socialApple || DEFAULT_CONTENT.socialApple,
          socialYoutube: data.socialYoutube || DEFAULT_CONTENT.socialYoutube,
          socialTwitter: data.socialTwitter || DEFAULT_CONTENT.socialTwitter,
          socialLinkedin: data.socialLinkedin || DEFAULT_CONTENT.socialLinkedin,
          socialInstagram: data.socialInstagram || DEFAULT_CONTENT.socialInstagram,
          featuredPodcastId: data.featuredPodcastId || null,
          teaserEnabled: data.teaserEnabled || false,
          teaserBadge: data.teaserBadge || "Bientôt disponible",
          teaserTitle: data.teaserTitle || null,
          teaserHook: data.teaserHook || null,
          teaserLinkUrl: data.teaserLinkUrl || null,
          teaserLinkLabel: data.teaserLinkLabel || "Voir l'annonce officielle",
          teaserReleaseDate: data.teaserReleaseDate ? new Date(data.teaserReleaseDate) : null,
          videoUrl: data.videoUrl ?? DEFAULT_CONTENT.videoUrl,
          audioEmbedUrl: data.audioEmbedUrl ?? DEFAULT_CONTENT.audioEmbedUrl,
        },
      });
      result = {
        id: created.id,
        heroTitle: created.heroTitle,
        heroSubtitle: created.heroSubtitle,
        bioText: created.bioText,
        contactEmail: created.contactEmail,
        socialSpotify: created.socialSpotify,
        socialApple: created.socialApple,
        socialYoutube: created.socialYoutube,
        socialTwitter: created.socialTwitter,
        socialLinkedin: created.socialLinkedin,
        socialInstagram: created.socialInstagram,
        featuredPodcastId: created.featuredPodcastId,
        teaserEnabled: created.teaserEnabled,
        teaserBadge: created.teaserBadge,
        teaserTitle: created.teaserTitle,
        teaserHook: created.teaserHook,
        teaserLinkUrl: created.teaserLinkUrl,
        teaserLinkLabel: created.teaserLinkLabel,
        teaserReleaseDate: created.teaserReleaseDate,
        videoUrl: created.videoUrl,
        audioEmbedUrl: created.audioEmbedUrl,
        updatedAt: created.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour updateWebsiteContent, persistance locale fichier :", err);
  }

  // Écriture du fichier JSON local pour persister immédiatement à travers tous les workers Next.js
  writeLocalJson(result);

  return result;
}
