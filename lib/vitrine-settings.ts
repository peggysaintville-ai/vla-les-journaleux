import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export * from "./vitrine-settings-types";
import { VitrineSettingsData, DEFAULT_VITRINE_SETTINGS } from "./vitrine-settings-types";

const JSON_FILE_PATH = path.join(process.cwd(), "lib", "vitrine-settings.json");

function readLocalJson(): VitrineSettingsData {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(JSON_FILE_PATH, "utf-8"));
      return { ...DEFAULT_VITRINE_SETTINGS, ...data };
    }
  } catch (e) {
    console.warn("Erreur lecture JSON local vitrine-settings :", e);
  }
  return DEFAULT_VITRINE_SETTINGS;
}

function writeLocalJson(data: VitrineSettingsData): void {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("Erreur écriture JSON local vitrine-settings :", e);
  }
}

/**
 * Récupère la configuration no-code de la vitrine
 */
export async function getVitrineSettings(): Promise<VitrineSettingsData> {
  try {
    let settings = await db.vitrineSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      settings = await db.vitrineSettings.create({
        data: {
          showTeaserBanner: DEFAULT_VITRINE_SETTINGS.showTeaserBanner,
          teaserTitle: DEFAULT_VITRINE_SETTINGS.teaserTitle,
          teaserSubtitle: DEFAULT_VITRINE_SETTINGS.teaserSubtitle,
          teaserAudioUrl: DEFAULT_VITRINE_SETTINGS.teaserAudioUrl,
          teaserExternalLink: DEFAULT_VITRINE_SETTINGS.teaserExternalLink,
          videoUrl: DEFAULT_VITRINE_SETTINGS.videoUrl,
          audioEmbedUrl: DEFAULT_VITRINE_SETTINGS.audioEmbedUrl,
          showAudioBackground: DEFAULT_VITRINE_SETTINGS.showAudioBackground,
          audioBackgroundUrl: DEFAULT_VITRINE_SETTINGS.audioBackgroundUrl,
          audioBackgroundTitle: DEFAULT_VITRINE_SETTINGS.audioBackgroundTitle,
          showPodcastsSection: DEFAULT_VITRINE_SETTINGS.showPodcastsSection,
          showArticlesSection: DEFAULT_VITRINE_SETTINGS.showArticlesSection,
          showBioSection: DEFAULT_VITRINE_SETTINGS.showBioSection,
          showContactSection: DEFAULT_VITRINE_SETTINGS.showContactSection,
          bioTitle: DEFAULT_VITRINE_SETTINGS.bioTitle,
          bioText: DEFAULT_VITRINE_SETTINGS.bioText,
        },
      });
    }

    if (settings) {
      const res: VitrineSettingsData = {
        id: settings.id,
        showTeaserBanner: settings.showTeaserBanner,
        teaserTitle: settings.teaserTitle ?? DEFAULT_VITRINE_SETTINGS.teaserTitle,
        teaserSubtitle: settings.teaserSubtitle ?? DEFAULT_VITRINE_SETTINGS.teaserSubtitle,
        teaserAudioUrl: settings.teaserAudioUrl ?? DEFAULT_VITRINE_SETTINGS.teaserAudioUrl,
        teaserExternalLink: settings.teaserExternalLink ?? DEFAULT_VITRINE_SETTINGS.teaserExternalLink,
        videoUrl: settings.videoUrl ?? DEFAULT_VITRINE_SETTINGS.videoUrl,
        audioEmbedUrl: settings.audioEmbedUrl ?? DEFAULT_VITRINE_SETTINGS.audioEmbedUrl,
        showAudioBackground: settings.showAudioBackground,
        audioBackgroundUrl: settings.audioBackgroundUrl ?? DEFAULT_VITRINE_SETTINGS.audioBackgroundUrl,
        audioBackgroundTitle: settings.audioBackgroundTitle ?? DEFAULT_VITRINE_SETTINGS.audioBackgroundTitle,
        showPodcastsSection: settings.showPodcastsSection,
        showArticlesSection: settings.showArticlesSection,
        showBioSection: settings.showBioSection,
        showContactSection: settings.showContactSection,
        bioTitle: settings.bioTitle ?? DEFAULT_VITRINE_SETTINGS.bioTitle,
        bioText: settings.bioText ?? DEFAULT_VITRINE_SETTINGS.bioText,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      };
      writeLocalJson(res);
      return res;
    }
  } catch (err) {
    console.warn("Base de données non jointe pour VitrineSettings, fallback local :", err);
  }

  return readLocalJson();
}

/**
 * Met à jour les réglages no-code de la vitrine
 */
export async function updateVitrineSettings(
  data: Partial<VitrineSettingsData>
): Promise<VitrineSettingsData> {
  const local = readLocalJson();
  let result: VitrineSettingsData = {
    ...local,
    ...data,
    updatedAt: new Date(),
  };

  try {
    const existing = await db.vitrineSettings.findFirst();
    if (existing) {
      const updated = await db.vitrineSettings.update({
        where: { id: existing.id },
        data: {
          showTeaserBanner: data.showTeaserBanner !== undefined ? data.showTeaserBanner : existing.showTeaserBanner,
          teaserTitle: data.teaserTitle !== undefined ? data.teaserTitle : existing.teaserTitle,
          teaserSubtitle: data.teaserSubtitle !== undefined ? data.teaserSubtitle : existing.teaserSubtitle,
          teaserAudioUrl: data.teaserAudioUrl !== undefined ? data.teaserAudioUrl : existing.teaserAudioUrl,
          teaserExternalLink: data.teaserExternalLink !== undefined ? data.teaserExternalLink : existing.teaserExternalLink,
          videoUrl: data.videoUrl !== undefined ? data.videoUrl : existing.videoUrl,
          audioEmbedUrl: data.audioEmbedUrl !== undefined ? data.audioEmbedUrl : existing.audioEmbedUrl,
          showAudioBackground: data.showAudioBackground !== undefined ? data.showAudioBackground : existing.showAudioBackground,
          audioBackgroundUrl: data.audioBackgroundUrl !== undefined ? data.audioBackgroundUrl : existing.audioBackgroundUrl,
          audioBackgroundTitle: data.audioBackgroundTitle !== undefined ? data.audioBackgroundTitle : existing.audioBackgroundTitle,
          showPodcastsSection: data.showPodcastsSection !== undefined ? data.showPodcastsSection : existing.showPodcastsSection,
          showArticlesSection: data.showArticlesSection !== undefined ? data.showArticlesSection : existing.showArticlesSection,
          showBioSection: data.showBioSection !== undefined ? data.showBioSection : existing.showBioSection,
          showContactSection: data.showContactSection !== undefined ? data.showContactSection : existing.showContactSection,
          bioTitle: data.bioTitle !== undefined ? data.bioTitle : existing.bioTitle,
          bioText: data.bioText !== undefined ? data.bioText : existing.bioText,
        },
      });

      result = {
        id: updated.id,
        showTeaserBanner: updated.showTeaserBanner,
        teaserTitle: updated.teaserTitle,
        teaserSubtitle: updated.teaserSubtitle,
        teaserAudioUrl: updated.teaserAudioUrl,
        teaserExternalLink: updated.teaserExternalLink,
        videoUrl: updated.videoUrl,
        audioEmbedUrl: updated.audioEmbedUrl,
        showAudioBackground: updated.showAudioBackground,
        audioBackgroundUrl: updated.audioBackgroundUrl,
        audioBackgroundTitle: updated.audioBackgroundTitle,
        showPodcastsSection: updated.showPodcastsSection,
        showArticlesSection: updated.showArticlesSection,
        showBioSection: updated.showBioSection,
        showContactSection: updated.showContactSection,
        bioTitle: updated.bioTitle,
        bioText: updated.bioText,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } else {
      const created = await db.vitrineSettings.create({
        data: {
          showTeaserBanner: data.showTeaserBanner ?? DEFAULT_VITRINE_SETTINGS.showTeaserBanner,
          teaserTitle: data.teaserTitle ?? DEFAULT_VITRINE_SETTINGS.teaserTitle,
          teaserSubtitle: data.teaserSubtitle ?? DEFAULT_VITRINE_SETTINGS.teaserSubtitle,
          teaserAudioUrl: data.teaserAudioUrl ?? DEFAULT_VITRINE_SETTINGS.teaserAudioUrl,
          teaserExternalLink: data.teaserExternalLink ?? DEFAULT_VITRINE_SETTINGS.teaserExternalLink,
          videoUrl: data.videoUrl ?? DEFAULT_VITRINE_SETTINGS.videoUrl,
          audioEmbedUrl: data.audioEmbedUrl ?? DEFAULT_VITRINE_SETTINGS.audioEmbedUrl,
          showAudioBackground: data.showAudioBackground ?? DEFAULT_VITRINE_SETTINGS.showAudioBackground,
          audioBackgroundUrl: data.audioBackgroundUrl ?? DEFAULT_VITRINE_SETTINGS.audioBackgroundUrl,
          audioBackgroundTitle: data.audioBackgroundTitle ?? DEFAULT_VITRINE_SETTINGS.audioBackgroundTitle,
          showPodcastsSection: data.showPodcastsSection ?? DEFAULT_VITRINE_SETTINGS.showPodcastsSection,
          showArticlesSection: data.showArticlesSection ?? DEFAULT_VITRINE_SETTINGS.showArticlesSection,
          showBioSection: data.showBioSection ?? DEFAULT_VITRINE_SETTINGS.showBioSection,
          showContactSection: data.showContactSection ?? DEFAULT_VITRINE_SETTINGS.showContactSection,
          bioTitle: data.bioTitle ?? DEFAULT_VITRINE_SETTINGS.bioTitle,
          bioText: data.bioText ?? DEFAULT_VITRINE_SETTINGS.bioText,
        },
      });

      result = {
        id: created.id,
        showTeaserBanner: created.showTeaserBanner,
        teaserTitle: created.teaserTitle,
        teaserSubtitle: created.teaserSubtitle,
        teaserAudioUrl: created.teaserAudioUrl,
        teaserExternalLink: created.teaserExternalLink,
        videoUrl: created.videoUrl,
        audioEmbedUrl: created.audioEmbedUrl,
        showAudioBackground: created.showAudioBackground,
        audioBackgroundUrl: created.audioBackgroundUrl,
        audioBackgroundTitle: created.audioBackgroundTitle,
        showPodcastsSection: created.showPodcastsSection,
        showArticlesSection: created.showArticlesSection,
        showBioSection: created.showBioSection,
        showContactSection: created.showContactSection,
        bioTitle: created.bioTitle,
        bioText: created.bioText,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour updateVitrineSettings, persistance locale :", err);
  }

  writeLocalJson(result);
  return result;
}
