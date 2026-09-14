import { Metadata } from "next";
import { db } from "@/lib/db";
import PodcastsListClient from "@/components/podcasts-list-client";

export const metadata: Metadata = {
  title: "Podcasts & Séries | V'LÀ LES JOURNALEUX",
  description: "Production, découpage d'épisodes et diffusion des podcasts d'investigation.",
};

export const dynamic = "force-dynamic";

export default async function PodcastsPage() {
  let podcasts: any[] = [];
  try {
    podcasts = await db.podcast.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        episodes: {
          select: {
            id: true,
            pipelineStatus: true,
            duration: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération podcasts:", error);
  }

  return <PodcastsListClient initialPodcasts={podcasts} />;
}
