"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getCurrentUser, signJWT, setAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateCompanySettings, CompanySettingsData } from "@/lib/company-settings";
import { localDevCollaborators } from "@/lib/users";
import { UserRole } from "@prisma/client";

export interface SettingsActionResult {
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action pour mettre à jour les coordonnées juridiques, bancaires et mentions obligatoires de facturation
 */
export async function updateCompanySettingsAction(
  prevState: unknown,
  formData: FormData
): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Session expirée. Veuillez vous reconnecter." };
    }

    const legalName = (formData.get("legalName") as string)?.trim() || "V'LÀ LES JOURNALEUX SAS";
    const tradeName = (formData.get("tradeName") as string)?.trim() || "V'LÀ LES JOURNALEUX";
    const siret = (formData.get("siret") as string)?.trim() || "";
    const vatNumber = (formData.get("vatNumber") as string)?.trim() || "";
    const apeCode = (formData.get("apeCode") as string)?.trim() || "";
    const address = (formData.get("address") as string)?.trim() || "";
    const postalCode = (formData.get("postalCode") as string)?.trim() || "";
    const city = (formData.get("city") as string)?.trim() || "";
    const country = (formData.get("country") as string)?.trim() || "France";
    const email = (formData.get("email") as string)?.trim() || "";
    const phone = (formData.get("phone") as string)?.trim() || "";
    const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || "";
    const iban = (formData.get("iban") as string)?.trim() || "";
    const bic = (formData.get("bic") as string)?.trim() || "";
    const bankName = (formData.get("bankName") as string)?.trim() || "";
    const legalNoticeInvoice = (formData.get("legalNoticeInvoice") as string)?.trim() || "";

    const payload: Partial<CompanySettingsData> = {
      legalName,
      tradeName,
      siret,
      vatNumber,
      apeCode,
      address,
      postalCode,
      city,
      country,
      email,
      phone,
      websiteUrl,
      iban,
      bic,
      bankName,
      legalNoticeInvoice,
    };

    await updateCompanySettings(payload);

    revalidatePath("/parametres");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Coordonnées de facturation et mentions légales enregistrées avec succès.",
    };
  } catch (err: any) {
    console.error("Erreur mise à jour CompanySettings :", err);
    return {
      error: err.message || "Une erreur inattendue est survenue lors de l'enregistrement.",
    };
  }
}

/**
 * Server Action pour mettre à jour le profil de la journaliste connectée (nom, email, mot de passe, avatar)
 */
export async function updateUserProfileAction(
  prevState: unknown,
  formData: FormData
): Promise<SettingsActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: "Session non authentifiée." };
    }

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const newPassword = (formData.get("newPassword") as string)?.trim();
    const avatar = (formData.get("avatar") as string)?.trim() || "";

    if (!name || !email) {
      return { error: "Le nom et l'email sont obligatoires." };
    }

    // Protection : interdiction absolue de prendre l'email madacreaapp@gmail.com
    if (email === "madacreaapp@gmail.com") {
      return { error: "Cette adresse email est réservée et interdite." };
    }

    let hashedPassword: string | undefined = undefined;
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 6) {
        return { error: "Le mot de passe doit comporter au moins 6 caractères." };
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    try {
      const updateData: {
        name: string;
        email: string;
        avatar?: string | null;
        passwordHash?: string;
      } = {
        name,
        email,
        avatar: avatar || null,
      };

      if (hashedPassword) {
        updateData.passwordHash = hashedPassword;
      }

      await db.user.update({
        where: { id: currentUser.userId },
        data: updateData,
      });
    } catch (dbErr) {
      console.warn("Base PostgreSQL non disponible pour le profil, mise à jour mock local :", dbErr);
      const localUser = localDevCollaborators.find((u) => u.id === currentUser.userId || u.email === currentUser.email);
      if (localUser) {
        localUser.name = name;
        localUser.email = email;
      }
    }

    // Régénération du cookie JWT avec les nouvelles données
    const newPayload = {
      userId: currentUser.userId,
      email,
      name,
      role: currentUser.role as UserRole,
    };
    const newToken = await signJWT(newPayload);
    await setAuthCookie(newToken);

    revalidatePath("/parametres");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Votre profil a été mis à jour avec succès.",
    };
  } catch (err: any) {
    console.error("Erreur mise à jour profil :", err);
    return {
      error: err.message || "Une erreur inattendue est survenue lors de la mise à jour de votre profil.",
    };
  }
}
