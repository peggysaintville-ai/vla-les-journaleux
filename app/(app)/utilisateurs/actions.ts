"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  localDevCollaborators,
  UserPermissions,
} from "@/lib/users";

export interface ActionState {
  success?: boolean;
  message?: string;
  error?: string;
}

// 1. Schéma Zod strict : Interdiction absolue d'attribuer SUPER_ADMIN
const CreateUserSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  email: z
    .string()
    .email("Adresse email invalide.")
    .refine(
      (e) => e.toLowerCase().trim() !== "madacreaapp@gmail.com",
      "Cette adresse est réservée et ne peut pas être utilisée."
    ),
  password: z.string().min(6, "Le mot de passe temporaire doit comporter au moins 6 caractères."),
  // Sélecteur restreint : Seuls JOURNALISTE_ADMIN et COLLABORATEUR sont acceptés
  role: z.enum(["JOURNALISTE_ADMIN", "COLLABORATEUR"], {
    message: "Rôle non autorisé. Seuls JOURNALISTE_ADMIN et COLLABORATEUR sont permis.",
  }),
});

/**
 * Crée un nouveau collaborateur avec permissions granulaires
 */
export async function createCollaboratorAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const currentUser = await getCurrentUser();

  // Seule une journaliste admin (ou admin) peut inviter
  if (!currentUser || (currentUser.role !== UserRole.JOURNALISTE_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return { error: "Action non autorisée. Vous devez être administratrice de rédaction." };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const parsed = CreateUserSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(" ");
    return { error: errorMsg };
  }

  const { name, email, password, role } = parsed.data;

  // Extraction des permissions cochées pour chaque module
  const permissions: UserPermissions = {
    podcasts: formData.get("perm_podcasts") === "on",
    interviews: formData.get("perm_interviews") === "on",
    facturation: formData.get("perm_facturation") === "on",
    planning: formData.get("perm_planning") === "on",
    crm: formData.get("perm_crm") === "on",
    contrats: formData.get("perm_contrats") === "on",
    analytics: formData.get("perm_analytics") === "on",
  };

  const targetRole = role as UserRole;
  const passwordHash = await bcrypt.hash(password, 10);

  // Mise à jour de la mémoire locale de secours
  const newLocalItem = {
    id: `local-user-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    role: targetRole,
    permissions,
    createdAt: new Date(),
  };
  localDevCollaborators.push(newLocalItem);

  try {
    // Vérification d'unicité email
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return { error: "Un compte avec cette adresse email existe déjà." };
    }

    await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: targetRole,
        permissions: permissions as unknown as Record<string, boolean>,
      },
    });
  } catch (err) {
    console.warn("Création en base ignorée (PostgreSQL local hors ligne), mémoire mise à jour :", err);
  }

  revalidatePath("/utilisateurs");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Le compte pour ${name} (${role}) a été créé avec succès.`,
  };
}

/**
 * Met à jour les permissions par module d'un collaborateur existant
 */
export async function updatePermissionsAction(
  userId: string,
  permissions: UserPermissions
): Promise<ActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== UserRole.JOURNALISTE_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return { error: "Action non autorisée." };
  }

  // Interdiction formelle de toucher à un SUPER_ADMIN
  try {
    const target = await db.user.findUnique({ where: { id: userId } });
    if (target?.role === UserRole.SUPER_ADMIN || target?.email === "madacreaapp@gmail.com") {
      return { error: "Opération strictement interdite sur ce compte." };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        permissions: permissions as unknown as Record<string, boolean>,
      },
    });
  } catch (err) {
    console.warn("Mise à jour permissions en base échouée, mise à jour mémoire :", err);
    const item = localDevCollaborators.find((u) => u.id === userId);
    if (item) {
      item.permissions = permissions;
    }
  }

  revalidatePath("/utilisateurs");
  revalidatePath("/dashboard");

  return { success: true, message: "Permissions mises à jour avec succès." };
}

/**
 * Supprime un collaborateur
 */
export async function deleteCollaboratorAction(userId: string): Promise<ActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== UserRole.JOURNALISTE_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN)) {
    return { error: "Action non autorisée." };
  }

  try {
    const target = await db.user.findUnique({ where: { id: userId } });
    if (target?.role === UserRole.SUPER_ADMIN || target?.email === "madacreaapp@gmail.com") {
      return { error: "Opération strictement interdite." };
    }

    await db.user.delete({ where: { id: userId } });
  } catch (err) {
    console.warn("Suppression en base échouée, suppression mémoire :", err);
    const idx = localDevCollaborators.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      localDevCollaborators.splice(idx, 1);
    }
  }

  revalidatePath("/utilisateurs");
  revalidatePath("/dashboard");

  return { success: true, message: "Collaborateur retiré de l'équipe." };
}
