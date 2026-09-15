"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getWebsiteContent, updateWebsiteContent, WebsiteContentData } from "@/lib/website-content";
import { getVitrineSettings, updateVitrineSettings, VitrineSettingsData } from "@/lib/vitrine-settings";
import { put, getDownloadUrl } from "@vercel/blob";

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

    // Récupération des réglages existants pour préserver les valeurs non modifiées
    const currentSettings = await getVitrineSettings().catch(() => null);

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
          access: "private",
        });
        heroPhotoUrl = getDownloadUrl(blob.url) || blob.downloadUrl || blob.url;
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
          access: "private",
        });
        teaserAudioUrl = getDownloadUrl(blob.url) || blob.downloadUrl || blob.url;
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
          access: "private",
        });
        audioBackgroundUrl = getDownloadUrl(blob.url) || blob.downloadUrl || blob.url;
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

    // 5. Section Soutien & Dons (Préservation stricte des valeurs existantes si non modifiées)
    const rawDonationEnabled = formData.get("donationEnabled");
    const donationEnabled = rawDonationEnabled !== null
      ? (rawDonationEnabled === "on" || rawDonationEnabled === "true")
      : (currentSettings?.donationEnabled ?? true);

    const rawDonationTitle = formData.get("donationTitle");
    const donationTitle = rawDonationTitle !== null && typeof rawDonationTitle === "string" && rawDonationTitle.trim().length > 0
      ? rawDonationTitle.trim()
      : (currentSettings?.donationTitle || "Soutenir notre journalisme indépendant");

    const rawDonationSubtitle = formData.get("donationSubtitle");
    const donationSubtitle = rawDonationSubtitle !== null && typeof rawDonationSubtitle === "string" && rawDonationSubtitle.trim().length > 0
      ? rawDonationSubtitle.trim()
      : (currentSettings?.donationSubtitle || "Aidez-nous à financer nos enquêtes et nos podcasts de terrain en toute liberté.");

    const rawDonationDescription = formData.get("donationDescription");
    const donationDescription = rawDonationDescription !== null && typeof rawDonationDescription === "string" && rawDonationDescription.trim().length > 0
      ? rawDonationDescription.trim()
      : (currentSettings?.donationDescription || "Chaque enquête approfondie nécessite des semaines de recherche documentaire, de déplacements sur le terrain et de vérification rigoureuse des sources.\n\nEn contribuant financièrement à notre studio, vous garantissez notre totale indépendance vis-à-vis des puissances économiques et politiques. Vos dons financent directement la production d'épisodes en accès libre et la protection de nos informateurs.");

    const rawDonationUrl = formData.get("donationUrl");
    const donationUrl = rawDonationUrl !== null && typeof rawDonationUrl === "string" && rawDonationUrl.trim().length > 0
      ? rawDonationUrl.trim()
      : (currentSettings?.donationUrl || "https://donate.stripe.com/demo");

    const rawDonationButtonText = formData.get("donationButtonText");
    const donationButtonText = rawDonationButtonText !== null && typeof rawDonationButtonText === "string" && rawDonationButtonText.trim().length > 0
      ? rawDonationButtonText.trim()
      : (currentSettings?.donationButtonText || "Faire un don libre");

    const rawDonationImageUrl = formData.get("donationImageUrl");
    let donationImageUrl = rawDonationImageUrl !== null && typeof rawDonationImageUrl === "string" && rawDonationImageUrl.trim().length > 0
      ? rawDonationImageUrl.trim()
      : (currentSettings?.donationImageUrl || null);

    const donationImageFile = formData.get("donationImageFile") as File | null;

    if (donationImageFile && donationImageFile.size > 0 && typeof donationImageFile.arrayBuffer === "function") {
      try {
        const cleanName = donationImageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`donations/${Date.now()}-${cleanName}`, donationImageFile, {
          access: "private",
        });
        donationImageUrl = getDownloadUrl(blob.url) || blob.downloadUrl || blob.url;
      } catch (uploadErr) {
        console.warn("Erreur upload Vercel Blob don :", uploadErr);
      }
    }

    if (!donationImageUrl) {
      donationImageUrl = currentSettings?.donationImageUrl || "/images/journalist-portrait.jpg";
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
    revalidatePath("/", "page");
    revalidatePath("/site-vitrine", "page");
    revalidatePath("/dashboard", "page");

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
