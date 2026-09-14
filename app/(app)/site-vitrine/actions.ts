"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateWebsiteContent, WebsiteContentData } from "@/lib/website-content";
import { updateVitrineSettings, VitrineSettingsData } from "@/lib/vitrine-settings";

export interface WebsiteContentActionResult {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function updateWebsiteContentAction(
  prevState: unknown,
  formData: FormData
): Promise<WebsiteContentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Session non authentifiée. Veuillez vous reconnecter." };
    }

    const heroTitle = (formData.get("heroTitle") as string)?.trim() || "Journalisme d'investigation, podcasts et récits engagés.";
    const heroSubtitle = (formData.get("heroSubtitle") as string)?.trim() || "De l'enquête au grand reportage, je raconte les récits qui dérangent et éclairent.";
    const bioText = (formData.get("bioText") as string)?.trim() || "";
    const bioTitle = (formData.get("bioTitle") as string)?.trim() || "L'indépendance comme boussole, l'humain comme centre.";
    const contactEmail = (formData.get("contactEmail") as string)?.trim() || "contact@vlalesjournaleux.fr";

    const socialSpotify = (formData.get("socialSpotify") as string)?.trim() || null;
    const socialApple = (formData.get("socialApple") as string)?.trim() || null;
    const socialYoutube = (formData.get("socialYoutube") as string)?.trim() || null;
    const socialTwitter = (formData.get("socialTwitter") as string)?.trim() || null;
    const socialLinkedin = (formData.get("socialLinkedin") as string)?.trim() || null;
    const socialInstagram = (formData.get("socialInstagram") as string)?.trim() || null;
    const featuredPodcastId = (formData.get("featuredPodcastId") as string)?.trim() || null;

    // 1. Teaser & Prochain Projet
    const showTeaserBanner = formData.get("showTeaserBanner") === "on" || formData.get("showTeaserBanner") === "true";
    const teaserTitle = (formData.get("teaserTitle") as string)?.trim() || null;
    const teaserSubtitle = (formData.get("teaserSubtitle") as string)?.trim() || null;
    const teaserAudioUrl = (formData.get("teaserAudioUrl") as string)?.trim() || null;
    const teaserExternalLink = (formData.get("teaserExternalLink") as string)?.trim() || null;
    const teaserBadge = (formData.get("teaserBadge") as string)?.trim() || "Bientôt disponible";
    const rawTeaserDate = formData.get("teaserReleaseDate") as string;
    const teaserReleaseDate = rawTeaserDate ? new Date(rawTeaserDate) : null;

    // 2. Lecteurs multimédias externes
    const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
    const audioEmbedUrl = (formData.get("audioEmbedUrl") as string)?.trim() || null;

    // 3. Musique d'ambiance
    const showAudioBackground = formData.get("showAudioBackground") === "on" || formData.get("showAudioBackground") === "true";
    const audioBackgroundUrl = (formData.get("audioBackgroundUrl") as string)?.trim() || null;
    const audioBackgroundTitle = (formData.get("audioBackgroundTitle") as string)?.trim() || null;

    // 4. Modularité & Visibilité des sections
    const showPodcastsSection = formData.get("showPodcastsSection") === "on" || formData.get("showPodcastsSection") === "true";
    const showArticlesSection = formData.get("showArticlesSection") === "on" || formData.get("showArticlesSection") === "true";
    const showBioSection = formData.get("showBioSection") === "on" || formData.get("showBioSection") === "true";
    const showContactSection = formData.get("showContactSection") === "on" || formData.get("showContactSection") === "true";

    // Mise à jour de VitrineSettings
    await updateVitrineSettings({
      showTeaserBanner,
      teaserTitle,
      teaserSubtitle,
      teaserAudioUrl,
      teaserExternalLink,
      videoUrl,
      audioEmbedUrl,
      showAudioBackground,
      audioBackgroundUrl,
      audioBackgroundTitle,
      showPodcastsSection,
      showArticlesSection,
      showBioSection,
      showContactSection,
      bioTitle,
      bioText,
    });

    // Mise à jour rétrocompatible de WebsiteContent
    await updateWebsiteContent({
      heroTitle,
      heroSubtitle,
      bioText,
      contactEmail,
      socialSpotify,
      socialApple,
      socialYoutube,
      socialTwitter,
      socialLinkedin,
      socialInstagram,
      featuredPodcastId,
      teaserEnabled: showTeaserBanner,
      teaserBadge,
      teaserTitle,
      teaserHook: teaserSubtitle,
      teaserLinkUrl: teaserExternalLink,
      teaserReleaseDate,
      videoUrl,
      audioEmbedUrl,
    });

    // Revalidation immédiate de la vitrine publique et du CMS
    revalidatePath("/");
    revalidatePath("/site-vitrine");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "La configuration no-code de la vitrine a été mise à jour et publiée !",
    };
  } catch (err: any) {
    console.error("Erreur updateWebsiteContentAction :", err);
    return {
      error: err.message || "Une erreur est survenue lors de l'enregistrement de la vitrine.",
    };
  }
}
