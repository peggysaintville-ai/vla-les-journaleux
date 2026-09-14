import { Metadata } from "next";
import { db } from "@/lib/db";
import InterviewsListClient from "@/components/interviews-list-client";

export const metadata: Metadata = {
  title: "Interviews & Dérushage | V'LÀ LES JOURNALEUX",
  description: "Cadrage éditorial, conducteur d'antenne, dérushage et citations clés.",
};

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  let interviews: any[] = [];
  let contacts: any[] = [];

  try {
    const [dbInterviews, dbContacts] = await Promise.all([
      db.interview.findMany({
        orderBy: [{ shootingDate: "asc" }, { createdAt: "desc" }],
        include: {
          contact: {
            select: {
              id: true,
              nom: true,
              entreprise: true,
              email: true,
              telephone: true,
            },
          },
        },
      }),
      db.contact.findMany({
        orderBy: { nom: "asc" },
        select: {
          id: true,
          nom: true,
          entreprise: true,
          type: true,
        },
      }),
    ]);

    interviews = dbInterviews;
    contacts = dbContacts;
  } catch (error) {
    console.error("Erreur récupération interviews:", error);
  }

  return (
    <InterviewsListClient
      initialInterviews={interviews}
      availableContacts={contacts}
    />
  );
}
