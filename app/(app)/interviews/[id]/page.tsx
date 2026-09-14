import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import InterviewDetailClient from "@/components/interview-detail-client";

interface InterviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: InterviewDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const interview = await db.interview.findUnique({
      where: { id },
      select: { title: true },
    });
    return {
      title: `${interview?.title || "Interview"} | V'LÀ LES JOURNALEUX`,
      description: "Conducteur d'antenne, trame de questions et dérushage.",
    };
  } catch {
    return {
      title: "Interview | V'LÀ LES JOURNALEUX",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { id } = await params;

  let interview: any = null;
  try {
    interview = await db.interview.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            nom: true,
            email: true,
            telephone: true,
            entreprise: true,
            notes: true,
            type: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération interview:", error);
  }

  if (!interview) {
    notFound();
  }

  return <InterviewDetailClient interview={interview} />;
}
