"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SaaSStatus, UserRole } from "@prisma/client";

export interface SaasActionResponse {
  success: boolean;
  message: string;
}

// État mémoire de secours pour le développement local si PostgreSQL est hors ligne
interface MemorySaaSConfig {
  clientKey: string;
  status: SaaSStatus;
  validUntil: Date;
  podcasts: boolean;
  interviews: boolean;
  facturation: boolean;
  planning: boolean;
  crm: boolean;
  contrats: boolean;
  analytics: boolean;
}

let localDevMemoryConfig: MemorySaaSConfig = {
  clientKey: "LOCAL_DEV_CLIENT_KEY",
  status: SaaSStatus.ACTIVE,
  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  podcasts: true,
  interviews: true,
  facturation: true,
  planning: true,
  crm: true,
  contrats: true,
  analytics: true,
};

export async function getSaaSConfigData() {
  try {
    const config = await db.saaSConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (config) {
      return config;
    }
  } catch (e) {
    console.warn("PostgreSQL hors ligne, lecture de l'état local :", e);
  }
  return localDevMemoryConfig;
}

/**
 * Mise à jour complète de la configuration SaaS (statut, validUntil, modules)
 */
export async function updateSaaSConfigAction(
  formData: FormData
): Promise<SaasActionResponse> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.email?.toLowerCase().trim() !== "madacreaapp@gmail.com")
  ) {
    return {
      success: false,
      message: "Accès refusé. Cette action est strictement réservée au Super Admin.",
    };
  }

  const statusStr = (formData.get("status") as string) || "ACTIVE";
  const validUntilStr = formData.get("validUntil") as string;
  const podcasts = formData.get("podcasts") === "on";
  const interviews = formData.get("interviews") === "on";
  const facturation = formData.get("facturation") === "on";
  const planning = formData.get("planning") === "on";
  const crm = formData.get("crm") === "on";
  const contrats = formData.get("contrats") === "on";
  const analytics = formData.get("analytics") === "on";

  const validUntil = validUntilStr ? new Date(validUntilStr) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const status = statusStr as SaaSStatus;

  // Mise à jour de la mémoire locale de secours
  localDevMemoryConfig = {
    ...localDevMemoryConfig,
    status,
    validUntil,
    podcasts,
    interviews,
    facturation,
    planning,
    crm,
    contrats,
    analytics,
  };

  try {
    await db.saaSConfig.upsert({
      where: { clientKey: "LOCAL_DEV_CLIENT_KEY" },
      update: {
        status,
        validUntil,
        podcasts,
        interviews,
        facturation,
        planning,
        crm,
        contrats,
        analytics,
      },
      create: {
        clientKey: "LOCAL_DEV_CLIENT_KEY",
        status,
        validUntil,
        podcasts,
        interviews,
        facturation,
        planning,
        crm,
        contrats,
        analytics,
      },
    });
  } catch (error) {
    console.warn("Mise à jour en base échouée (PostgreSQL local hors ligne), mémoire mise à jour :", error);
  }

  revalidatePath("/saas");
  revalidatePath("/dashboard");
  revalidatePath("/api/saas-check");

  return {
    success: true,
    message: "Configuration de la licence SaaS mise à jour avec succès.",
  };
}

/**
 * Simulation instantanée du statut (ACTIVE, EXPIRED, SUSPENDED)
 */
export async function simulateStatusAction(
  targetStatus: SaaSStatus
): Promise<SaasActionResponse> {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.email?.toLowerCase().trim() !== "madacreaapp@gmail.com")
  ) {
    return {
      success: false,
      message: "Accès refusé. Cette action est strictement réservée au Super Admin.",
    };
  }

  localDevMemoryConfig.status = targetStatus;

  if (targetStatus === SaaSStatus.ACTIVE) {
    localDevMemoryConfig.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else if (targetStatus === SaaSStatus.EXPIRED) {
    // Si expiré, antidater la validité pour simuler une date passée
    localDevMemoryConfig.validUntil = new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  try {
    await db.saaSConfig.upsert({
      where: { clientKey: "LOCAL_DEV_CLIENT_KEY" },
      update: {
        status: targetStatus,
        validUntil: localDevMemoryConfig.validUntil,
      },
      create: {
        clientKey: "LOCAL_DEV_CLIENT_KEY",
        status: targetStatus,
        validUntil: localDevMemoryConfig.validUntil,
        podcasts: true,
        interviews: true,
        facturation: true,
        planning: true,
        crm: true,
        contrats: true,
        analytics: true,
      },
    });
  } catch (error) {
    console.warn("Simulation en base ignorée (PostgreSQL local hors ligne), mémoire mise à jour :", error);
  }

  revalidatePath("/saas");
  revalidatePath("/dashboard");
  revalidatePath("/api/saas-check");

  return {
    success: true,
    message: `Statut simulé avec succès : ${targetStatus}`,
  };
}
