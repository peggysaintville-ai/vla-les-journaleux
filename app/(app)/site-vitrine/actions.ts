"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateWebsiteContent, WebsiteContentData } from "@/lib/website-content";
import { updateVitrineSettings, VitrineSettingsData } from "@/lib/vitrine-settings";

import fs from "fs";
import path from "path";

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

    // Gestion de la photo du journaliste (Data URL base64, Upload de fichier ou URL)
    let heroPhotoUrl = (formData.get("heroPhotoUrl") as string)?.trim() || null;
    const heroPhotoFile = formData.get("heroPhotoFile") as File | null;

    if (heroPhotoFile && heroPhotoFile.size > 0 && typeof heroPhotoFile.arrayBuffer === "function") {
      try {
        const bytes = await heroPhotoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanName = heroPhotoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `portrait-${Date.now()}-${cleanName}`;
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        heroPhotoUrl = `/uploads/${fileName}`;
      } catch (uploadErr) {
        console.warn("Erreur sauvegarde upload image :", uploadErr);
      }
    } else if (heroPhotoUrl && heroPhotoUrl.startsWith("data:image/")) {
      try {
        const matches = heroPhotoUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const fileName = `portrait-${Date.now()}.${ext}`;
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          heroPhotoUrl = `/uploads/${fileName}`;
        }
      } catch (diskErr) {
        console.warn("Stockage direct de la Data URL en base Neon (fallback serverless) :", diskErr);
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
        const bytes = await teaserAudioFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanName = teaserAudioFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `teaser-${Date.now()}-${cleanName}`;
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        teaserAudioUrl = `/uploads/${fileName}`;
      } catch (uploadErr) {
        console.warn("Erreur sauvegarde upload audio teaser :", uploadErr);
      }
    } else if (teaserAudioUrl && teaserAudioUrl.startsWith("data:audio/")) {
      try {
        const matches = teaserAudioUrl.match(/^data:audio\/([a-zA-Z0-9.-]+);base64,(.+)$/);
        if (matches) {
          let ext = matches[1];
          if (ext === "mpeg" || ext === "mp3") ext = "mp3";
          else if (ext === "x-m4a" || ext === "m4a") ext = "m4a";
          else if (ext === "wav" || ext === "x-wav") ext = "wav";
          else if (ext.includes("ogg")) ext = "ogg";
          else ext = "mp3";
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const fileName = `teaser-audio-${Date.now()}.${ext}`;
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          teaserAudioUrl = `/uploads/${fileName}`;
        }
      } catch (diskErr) {
        console.warn("Stockage direct de la Data URL audio en base Neon (fallback serverless) :", diskErr);
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
        const bytes = await audioBackgroundFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanName = audioBackgroundFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `ambiance-${Date.now()}-${cleanName}`;
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        audioBackgroundUrl = `/uploads/${fileName}`;
      } catch (uploadErr) {
        console.warn("Erreur sauvegarde upload audio ambiance :", uploadErr);
      }
    } else if (audioBackgroundUrl && audioBackgroundUrl.startsWith("data:audio/")) {
      try {
        const matches = audioBackgroundUrl.match(/^data:audio\/([a-zA-Z0-9.-]+);base64,(.+)$/);
        if (matches) {
          let ext = matches[1];
          if (ext === "mpeg" || ext === "mp3") ext = "mp3";
          else if (ext.includes("ogg")) ext = "ogg";
          else if (ext === "wav" || ext === "x-wav") ext = "wav";
          else if (ext === "x-m4a" || ext === "m4a") ext = "m4a";
          else ext = "mp3";
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const fileName = `ambiance-audio-${Date.now()}.${ext}`;
          fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
          audioBackgroundUrl = `/uploads/${fileName}`;
        }
      } catch (diskErr) {
        console.warn("Stockage direct de la Data URL audio ambiance en base Neon (fallback serverless) :", diskErr);
      }
    }

    const audioBackgroundTitle = (formData.get("audioBackgroundTitle") as string)?.trim() || null;

    // 4. Modularité & Visibilité des sections
    const showPodcastsSection = formData.get("showPodcastsSection") === "on" || formData.get("showPodcastsSection") === "true";
    const showArticlesSection = formData.get("showArticlesSection") === "on" || formData.get("showArticlesSection") === "true";
    const showBioSection = formData.get("showBioSection") === "on" || formData.get("showBioSection") === "true";
    const showContactSection = formData.get("showContactSection") === "on" || formData.get("showContactSection") === "true";

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
