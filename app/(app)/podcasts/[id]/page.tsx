import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PodcastDetailClient from "@/components/podcast-detail-client";

interface PodcastPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PodcastPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const podcast = await db.podcast.findUnique({
      where: { id },
      select: { title: true },
    });
    return {
      title: `${podcast?.title || "Podcast"} | V'LÀ LES JOURNALEUX`,
      description: "Pipeline de production d'épisodes et publication.",
    };
  } catch {
    return {
      title: "Podcast | V'LÀ LES JOURNALEUX",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function PodcastDetailPage({ params }: PodcastPageProps) {
  const { id } = await params;

  let podcast: any = null;
  try {
    podcast = await db.podcast.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: [
            { season: "desc" },
            { episodeNumber: "asc" },
            { createdAt: "desc" },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération podcast:", error);
  }

  if (!podcast) {
    notFound();
  }

  return (
    <PodcastDetailClient
      podcast={{
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        coverImage: podcast.coverImage,
        rssFeedUrl: podcast.rssFeedUrl,
        spotifyUrl: podcast.spotifyUrl,
        appleUrl: podcast.appleUrl,
        videoUrl: podcast.videoUrl,
        audioEmbedUrl: podcast.audioEmbedUrl,
        isPublic: podcast.isPublic,
      }}
      initialEpisodes={podcast.episodes}
    />
  );
}
