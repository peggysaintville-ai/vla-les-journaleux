"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { InterviewStatus } from "@prisma/client";

export interface InterviewFormData {
  title: string;
  status?: InterviewStatus;
  contactId?: string;
  shootingDate?: string;
  location?: string;
  notes?: string;
  deliverables?: string;
  audioUrl?: string;
  transcript?: string;
  rundown?: any;
  questions?: any;
  quotes?: any;
  // Si création rapide de contact
  newContact?: {
    nom: string;
    email?: string;
    telephone?: string;
    entreprise?: string;
    notes?: string;
  };
}

// 1. Créer une interview (avec possibilité de créer un nouveau contact à la volée)
export async function createInterviewAction(data: InterviewFormData) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Le titre du projet / sujet est obligatoire." };
    }

    let contactId = data.contactId;

    // Création rapide du contact si demandé
    if (!contactId && data.newContact && data.newContact.nom?.trim()) {
      const createdContact = await db.contact.create({
        data: {
          nom: data.newContact.nom.trim(),
          email: data.newContact.email?.trim() || null,
          telephone: data.newContact.telephone?.trim() || null,
          entreprise: data.newContact.entreprise?.trim() || null,
          notes: data.newContact.notes?.trim() || null,
          type: "INVITE",
        },
      });
      contactId = createdContact.id;
    }

    const newInterview = await db.interview.create({
      data: {
        title: data.title.trim(),
        status: data.status || InterviewStatus.PREPARATION,
        contactId: contactId || null,
        shootingDate: data.shootingDate ? new Date(data.shootingDate) : null,
        location: data.location?.trim() || null,
        notes: data.notes?.trim() || null,
        deliverables: data.deliverables?.trim() || null,
        audioUrl: data.audioUrl?.trim() || null,
        transcript: data.transcript?.trim() || null,
        questions: data.questions || [
          { id: "q1", order: 1, text: "Pouvez-vous vous présenter et situer le contexte de votre alerte ?", answered: false },
        ],
        rundown: data.rundown || [
          { id: "b1", order: 1, title: "1. Accroche & Présentation du sujet", durationMin: 3, status: "EN_ATTENTE", notes: "Citer l'angle d'enquête et l'invité.", speaker: "Journaliste" },
          { id: "b2", order: 2, title: "2. Témoignage & Révélations", durationMin: 15, status: "EN_ATTENTE", notes: "Dérouler les faits et pièces justificatives.", speaker: "Invité" },
          { id: "b3", order: 3, title: "3. Droit de suite & Conclusion", durationMin: 5, status: "EN_ATTENTE", notes: "Perspectives et suites éditoriales.", speaker: "Journaliste & Invité" },
        ],
        quotes: data.quotes || [],
      },
    });

    revalidatePath("/interviews");
    return { success: true, interview: newInterview };
  } catch (error: any) {
    console.error("Erreur createInterviewAction:", error);
    return { success: false, error: "Impossible de créer l'interview." };
  }
}

// 2. Modifier une interview
export async function updateInterviewAction(id: string, data: Partial<InterviewFormData>) {
  try {
    if (!id) return { success: false, error: "ID d'interview manquant." };

    const updated = await db.interview.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.contactId !== undefined ? { contactId: data.contactId || null } : {}),
        ...(data.shootingDate !== undefined ? { shootingDate: data.shootingDate ? new Date(data.shootingDate) : null } : {}),
        ...(data.location !== undefined ? { location: data.location?.trim() || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.deliverables !== undefined ? { deliverables: data.deliverables?.trim() || null } : {}),
        ...(data.audioUrl !== undefined ? { audioUrl: data.audioUrl?.trim() || null } : {}),
        ...(data.transcript !== undefined ? { transcript: data.transcript?.trim() || null } : {}),
        ...(data.rundown !== undefined ? { rundown: data.rundown } : {}),
        ...(data.questions !== undefined ? { questions: data.questions } : {}),
        ...(data.quotes !== undefined ? { quotes: data.quotes } : {}),
      },
    });

    revalidatePath("/interviews");
    revalidatePath(`/interviews/${id}`);
    return { success: true, interview: updated };
  } catch (error: any) {
    console.error("Erreur updateInterviewAction:", error);
    return { success: false, error: "Impossible de modifier l'interview." };
  }
}

// 3. Mettre à jour le statut
export async function updateInterviewStatusAction(id: string, status: InterviewStatus) {
  try {
    const updated = await db.interview.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/interviews");
    revalidatePath(`/interviews/${id}`);
    return { success: true, interview: updated };
  } catch (error: any) {
    console.error("Erreur updateInterviewStatusAction:", error);
    return { success: false, error: "Impossible de mettre à jour le statut." };
  }
}

// 4. Archiver / Supprimer une interview
export async function archiveInterviewAction(id: string) {
  try {
    const updated = await db.interview.update({
      where: { id },
      data: { status: InterviewStatus.ARCHIVE },
    });

    revalidatePath("/interviews");
    return { success: true, interview: updated };
  } catch (error: any) {
    console.error("Erreur archiveInterviewAction:", error);
    return { success: false, error: "Impossible d'archiver l'interview." };
  }
}

export async function deleteInterviewAction(id: string) {
  try {
    await db.interview.delete({
      where: { id },
    });

    revalidatePath("/interviews");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteInterviewAction:", error);
    return { success: false, error: "Impossible de supprimer l'interview." };
  }
}
