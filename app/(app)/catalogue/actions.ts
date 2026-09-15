"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const pricingOfferSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le titre de la prestation doit contenir au moins 2 caractères"),
  subtitle: z.string().optional().default(""),
  unitPrice: z.coerce.number().min(0, "Le prix doit être supérieur ou égal à 0"),
  unit: z.string().min(1, "L'unité ou période est requise (ex: par épisode, par jour, forfait)"),
  isPopular: z.boolean().default(false),
  deliverables: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type PricingOfferInput = z.infer<typeof pricingOfferSchema>;

/**
 * Création d'une nouvelle offre de prestation au catalogue
 */
export async function createPricingOfferAction(data: FormData | PricingOfferInput) {
  try {
    let rawData: any = {};
    if (data instanceof FormData) {
      const rawDeliverables = data.get("deliverables")?.toString();
      let deliverablesArray: string[] = [];
      if (rawDeliverables) {
        try {
          deliverablesArray = JSON.parse(rawDeliverables);
        } catch {
          deliverablesArray = data.getAll("deliverables").map((d) => d.toString()).filter(Boolean);
        }
      } else {
        deliverablesArray = data.getAll("deliverables").map((d) => d.toString()).filter(Boolean);
      }

      rawData = {
        name: data.get("name")?.toString() || data.get("title")?.toString() || "",
        subtitle: data.get("subtitle")?.toString() || "",
        unitPrice: data.get("unitPrice") ? Number(data.get("unitPrice")) : 0,
        unit: data.get("unit")?.toString() || "forfait",
        isPopular: data.get("isPopular") === "true" || data.get("isPopular") === "on",
        deliverables: deliverablesArray,
      };
    } else {
      rawData = data;
    }

    const parsed = pricingOfferSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données d'offre invalides" };
    }

    const { name, subtitle, unitPrice, unit, isPopular, deliverables } = parsed.data;
    const descriptionJson = JSON.stringify({
      description: subtitle || "",
      subtitle: subtitle || "",
      isPopular,
      tag: isPopular ? "Populaire" : "Prestation",
      deliverables,
    });

    const created = await db.serviceCatalog.create({
      data: {
        name,
        description: descriptionJson,
        unitPrice,
        unit,
        isPublic: true,
        isActive: true,
      },
    });

    revalidatePath("/catalogue");
    revalidatePath("/catalogue-tarifs");
    revalidatePath("/");

    return {
      success: true,
      offer: {
        id: created.id,
        name: created.name,
        description: subtitle,
        subtitle,
        unitPrice: Number(created.unitPrice),
        unit: created.unit,
        isPublic: created.isPublic,
        isActive: created.isActive,
        isPopular,
        tag: isPopular ? "Populaire" : "Prestation",
        deliverables,
      },
    };
  } catch (error: any) {
    console.error("Erreur createPricingOfferAction :", error);
    return { success: false, error: error?.message || "Erreur lors de la création de l'offre" };
  }
}

/**
 * Mise à jour d'une offre existante au catalogue
 */
export async function updatePricingOfferAction(data: FormData | PricingOfferInput) {
  try {
    let rawData: any = {};
    if (data instanceof FormData) {
      const rawDeliverables = data.get("deliverables")?.toString();
      let deliverablesArray: string[] = [];
      if (rawDeliverables) {
        try {
          deliverablesArray = JSON.parse(rawDeliverables);
        } catch {
          deliverablesArray = data.getAll("deliverables").map((d) => d.toString()).filter(Boolean);
        }
      } else {
        deliverablesArray = data.getAll("deliverables").map((d) => d.toString()).filter(Boolean);
      }

      rawData = {
        id: data.get("id")?.toString(),
        name: data.get("name")?.toString() || data.get("title")?.toString() || "",
        subtitle: data.get("subtitle")?.toString() || "",
        unitPrice: data.get("unitPrice") ? Number(data.get("unitPrice")) : 0,
        unit: data.get("unit")?.toString() || "forfait",
        isPopular: data.get("isPopular") === "true" || data.get("isPopular") === "on",
        deliverables: deliverablesArray,
      };
    } else {
      rawData = data;
    }

    if (!rawData.id) {
      return { success: false, error: "Identifiant d'offre requis pour la modification" };
    }

    const parsed = pricingOfferSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Données d'offre invalides" };
    }

    const { id, name, subtitle, unitPrice, unit, isPopular, deliverables } = parsed.data;
    const descriptionJson = JSON.stringify({
      description: subtitle || "",
      subtitle: subtitle || "",
      isPopular,
      tag: isPopular ? "Populaire" : "Prestation",
      deliverables,
    });

    const updated = await db.serviceCatalog.update({
      where: { id },
      data: {
        name,
        description: descriptionJson,
        unitPrice,
        unit,
      },
    });

    revalidatePath("/catalogue");
    revalidatePath("/catalogue-tarifs");
    revalidatePath("/");

    return {
      success: true,
      offer: {
        id: updated.id,
        name: updated.name,
        description: subtitle,
        subtitle,
        unitPrice: Number(updated.unitPrice),
        unit: updated.unit,
        isPublic: updated.isPublic,
        isActive: updated.isActive,
        isPopular,
        tag: isPopular ? "Populaire" : "Prestation",
        deliverables,
      },
    };
  } catch (error: any) {
    console.error("Erreur updatePricingOfferAction :", error);
    return { success: false, error: error?.message || "Erreur lors de la mise à jour de l'offre" };
  }
}

/**
 * Suppression d'une offre du catalogue
 */
export async function deletePricingOfferAction(id: string) {
  try {
    if (!id) {
      return { success: false, error: "Identifiant d'offre requis" };
    }

    try {
      await db.serviceCatalog.delete({
        where: { id },
      });
    } catch {
      // Si une facture ou un devis y fait référence, désactivation douce (soft delete)
      await db.serviceCatalog.update({
        where: { id },
        data: { isActive: false, isPublic: false },
      });
    }

    revalidatePath("/catalogue");
    revalidatePath("/catalogue-tarifs");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Erreur deletePricingOfferAction :", error);
    return { success: false, error: error?.message || "Erreur lors de la suppression de l'offre" };
  }
}
