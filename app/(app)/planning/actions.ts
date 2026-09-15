"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const planningSessionSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  startDateTime: z.string().min(1, "La date et l'heure de début sont requises"),
  endDateTime: z.string().optional(),
  eventType: z.string().default("INTERVIEW"),
  userId: z.string().optional(),
  status: z.string().default("PLANIFIE"),
  location: z.string().optional(),
  description: z.string().optional(),
});

export interface PlanningActionResult {
  success?: boolean;
  error?: string;
  message?: string;
  event?: any;
}

export async function createPlanningSessionAction(
  prevState: unknown,
  formData: FormData
): Promise<PlanningActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Session non authentifiée. Veuillez vous reconnecter." };
  }

  const rawTitle = (formData.get("title") as string)?.trim() || "";
  const rawStartDateTime = (formData.get("startDateTime") as string)?.trim() || "";
  const rawEndDateTime = (formData.get("endDateTime") as string)?.trim() || "";
  const rawEventType = (formData.get("eventType") as string)?.trim() || "INTERVIEW";
  const rawUserId = (formData.get("userId") as string)?.trim() || user.userId;
  const rawStatus = (formData.get("status") as string)?.trim() || "PLANIFIE";
  const rawLocation = (formData.get("location") as string)?.trim() || "";
  const rawDescription = (formData.get("description") as string)?.trim() || "";

  const parsed = planningSessionSchema.safeParse({
    title: rawTitle,
    startDateTime: rawStartDateTime,
    endDateTime: rawEndDateTime || undefined,
    eventType: rawEventType,
    userId: rawUserId,
    status: rawStatus,
    location: rawLocation || undefined,
    description: rawDescription || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données de planification invalides.",
    };
  }

  try {
    const startDate = new Date(parsed.data.startDateTime);
    if (isNaN(startDate.getTime())) {
      return { success: false, error: "Date et heure de début invalides." };
    }

    let endDate: Date;
    if (parsed.data.endDateTime) {
      const parsedEnd = new Date(parsed.data.endDateTime);
      endDate = isNaN(parsedEnd.getTime()) ? new Date(startDate.getTime() + 2 * 3600 * 1000) : parsedEnd;
    } else {
      // 2 heures par défaut pour une session studio ou tournage
      endDate = new Date(startDate.getTime() + 2 * 3600 * 1000);
    }

    const newEvent = await db.calendarEvent.create({
      data: {
        title: parsed.data.title,
        startDate,
        endDate,
        eventType: parsed.data.eventType,
        status: parsed.data.status,
        userId: parsed.data.userId || user.userId,
        location: parsed.data.location || "Studio Audio Central",
        description: parsed.data.description || null,
        allDay: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    revalidatePath("/planning");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Session "${newEvent.title}" planifiée avec succès !`,
      event: newEvent,
    };
  } catch (err: any) {
    console.error("Erreur createPlanningSessionAction :", err);
    return {
      success: false,
      error: err.message || "Erreur lors de l'enregistrement de la session.",
    };
  }
}

export async function deletePlanningSessionAction(id: string): Promise<PlanningActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  try {
    await db.calendarEvent.delete({
      where: { id },
    });

    revalidatePath("/planning");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Session supprimée du planning.",
    };
  } catch (err: any) {
    console.error("Erreur deletePlanningSessionAction :", err);
    return {
      success: false,
      error: err.message || "Impossible de supprimer la session.",
    };
  }
}

export async function updatePlanningStatusAction(
  id: string,
  newStatus: string
): Promise<PlanningActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  try {
    const updated = await db.calendarEvent.update({
      where: { id },
      data: { status: newStatus },
      include: { user: true },
    });

    revalidatePath("/planning");
    return {
      success: true,
      message: `Statut mis à jour : ${newStatus}`,
      event: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur lors de la mise à jour du statut.",
    };
  }
}
