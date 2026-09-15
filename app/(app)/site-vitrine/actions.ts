"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateWebsiteContent, WebsiteContentData } from "@/lib/website-content";
import { updateVitrineSettings, VitrineSettingsData } from "@/lib/vitrine-settings";
import { put } from "@vercel/blob";

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

    // 0. Identité & Présentation Hero du Journaliste
    const heroJournalistName = (formData.get("heroJournalistName") as string)?.trim() || "Peggy SAINT-VILLE";
    const heroSubtitle = (formData.get("heroSubtitle") as string)?.trim() || "Studio de Production & Rédaction d'Investigation Sonore";
    const heroTitle = (formData.get("heroTitle") as string)?.trim() || "Révéler le réel : journalisme d'investigation, podcasts et récits engagés.";
    const heroBio = (formData.get("heroBio") as string)?.trim() || "";
    const heroBadgeStatus = (formData.get("heroBadgeStatus") as string)?.trim() || "En production active";
    const heroCaption = (formData.get("heroCaption") as string)?.trim() || "En direct de la rédaction centrale";
    const heroPhotoPosition = (formData.get("heroPhotoPosition") as string)?.trim() || "center center";

    // Gestion de la photo du journaliste (URL Vercel Blob, Data URL ou upload direct)
    let heroPhotoUrl = (formData.get("heroPhotoUrl") as string)?.trim() || null;
    const heroPhotoFile = formData.get("heroPhotoFile") as File | null;

    if (heroPhotoFile && heroPhotoFile.size > 0 && typeof heroPhotoFile.arrayBuffer === "function") {
      try {
        const cleanName = heroPhotoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`portraits/${Date.now()}-${cleanName}`, heroPhotoFile, {
          access: "public",
        });
        heroPhotoUrl = blob.url;
      } catch (uploadErr) {
        console.warn("Erreur upload Vercel Blob image portrait :", uploadErr);
      }
    }

    if (!heroPhotoUrl) {
      heroPhotoUrl = "/images/journalist-portrait.jpg";
    }

    const bioText = (formData.get("bioText") as string)?.trim() || heroBio || "";
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
    let teaserAudioUrl = (formData.get("teaserAudioUrl") as string)?.trim() || null;
    const teaserAudioFile = formData.get("teaserAudioFile") as File | null;

    if (teaserAudioFile && teaserAudioFile.size > 0 && typeof teaserAudioFile.arrayBuffer === "function") {
      try {
        const cleanName = teaserAudioFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`teaser/${Date.now()}-${cleanName}`, teaserAudioFile, {
          access: "public",
        });
        teaserAudioUrl = blob.url;
      } catch (uploadErr) {
        console.warn("Erreur upload Vercel Blob teaser :", uploadErr);
      }
    }

    const teaserExternalLink = (formData.get("teaserExternalLink") as string)?.trim() || null;
    const teaserBadge = (formData.get("teaserBadge") as string)?.trim() || "Bientôt disponible";
    const rawTeaserDate = formData.get("teaserReleaseDate") as string;
    const teaserReleaseDate = rawTeaserDate ? new Date(rawTeaserDate) : null;

    // 2. Lecteurs multimédias externes
    const videoUrl = (formData.get("videoUrl") as string)?.trim() || null;
    const audioEmbedUrl = (formData.get("audioEmbedUrl") as string)?.trim() || null;

    // 3. Musique d'ambiance
    const showAudioBackground = formData.get("showAudioBackground") === "on" || formData.get("showAudioBackground") === "true";
    let audioBackgroundUrl = (formData.get("audioBackgroundUrl") as string)?.trim() || null;
    const audioBackgroundFile = formData.get("audioBackgroundFile") as File | null;

    if (audioBackgroundFile && audioBackgroundFile.size > 0 && typeof audioBackgroundFile.arrayBuffer === "function") {
      try {
        const cleanName = audioBackgroundFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`ambiance/${Date.now()}-${cleanName}`, audioBackgroundFile, {
          access: "public",
        });
        audioBackgroundUrl = blob.url;
      } catch (uploadErr) {
        console.warn("Erreur upload Vercel Blob ambiance :", uploadErr);
      }
    }

    const audioBackgroundTitle = (formData.get("audioBackgroundTitle") as string)?.trim() || null;

    // 4. Modularité & Visibilité des sections
    const showPodcastsSection = formData.get("showPodcastsSection") === "on" || formData.get("showPodcastsSection") === "true";
    const showArticlesSection = formData.get("showArticlesSection") === "on" || formData.get("showArticlesSection") === "true";
    const showBioSection = formData.get("showBioSection") === "on" || formData.get("showBioSection") === "true";
    const showContactSection = formData.get("showContactSection") === "on" || formData.get("showContactSection") === "true";

    // 5. Section Soutien & Dons
    const donationEnabled = formData.get("donationEnabled") === "on" || formData.get("donationEnabled") === "true";
    const donationTitle = (formData.get("donationTitle") as string)?.trim() || "Soutenir notre journalisme indépendant";
    const donationSubtitle = (formData.get("donationSubtitle") as string)?.trim() || "Aidez-nous à financer nos enquêtes et nos podcasts de terrain en toute liberté.";
    const donationDescription = (formData.get("donationDescription") as string)?.trim() || "";
    const donationUrl = (formData.get("donationUrl") as string)?.trim() || "";
    const donationButtonText = (formData.get("donationButtonText") as string)?.trim() || "Faire un don libre";
    let donationImageUrl = (formData.get("donationImageUrl") as string)?.trim() || null;
    const donationImageFile = formData.get("donationImageFile") as File | null;

    if (donationImageFile && donationImageFile.size > 0 && typeof donationImageFile.arrayBuffer === "function") {
      try {
        const cleanName = donationImageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`donations/${Date.now()}-${cleanName}`, donationImageFile, {
          access: "public",
        });
        donationImageUrl = blob.url;
      } catch (uploadErr) {
        console.warn("Erreur upload Vercel Blob don :", uploadErr);
      }
    }

    // Mise à jour de VitrineSettings dans la base Neon
    await updateVitrineSettings({
      heroJournalistName,
      heroSubtitle,
      heroTitle,
      heroBio: heroBio || bioText,
      heroPhotoUrl,
      heroPhotoPosition,
      heroBadgeStatus,
      heroCaption,
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
      bioText: bioText || heroBio,
      donationEnabled,
      donationTitle,
      donationSubtitle,
      donationDescription,
      donationUrl,
      donationButtonText,
      donationImageUrl,
    });

    // Mise à jour rétrocompatible de WebsiteContent
    await updateWebsiteContent({
      heroTitle,
      heroSubtitle,
      bioText: bioText || heroBio,
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
