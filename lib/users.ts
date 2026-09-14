import { db } from "@/lib/db";
import { Prisma, UserRole } from "@prisma/client";

export interface UserPermissions {
  podcasts: boolean;
  interviews: boolean;
  facturation: boolean;
  planning: boolean;
  crm: boolean;
  contrats: boolean;
  analytics: boolean;
}

export interface CollaboratorItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: Date;
}

export const DEFAULT_COLLABORATOR_PERMISSIONS: UserPermissions = {
  podcasts: true,
  interviews: true,
  facturation: false,
  planning: true,
  crm: true,
  contrats: false,
  analytics: false,
};

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  podcasts: true,
  interviews: true,
  facturation: true,
  planning: true,
  crm: true,
  contrats: true,
  analytics: true,
};

// Mémoire de secours en local si la base PostgreSQL est déconnectée
export const localDevCollaborators: CollaboratorItem[] = [
  {
    id: "seed-user-louise",
    name: "Louise Presse",
    email: "louise@presse.local",
    role: UserRole.JOURNALISTE_ADMIN,
    permissions: DEFAULT_ADMIN_PERMISSIONS,
    createdAt: new Date("2026-01-15T09:00:00Z"),
  },
  {
    id: "seed-user-julien",
    name: "Julien Rédacteur",
    email: "julien.redac@presse.local",
    role: UserRole.COLLABORATEUR,
    permissions: {
      podcasts: true,
      interviews: true,
      facturation: false,
      planning: true,
      crm: false,
      contrats: false,
      analytics: false,
    },
    createdAt: new Date("2026-03-01T10:30:00Z"),
  },
];

/**
 * Récupère les collaborateurs / utilisateurs de l'espace journalistique
 * en excluant STRICTEMENT tout compte SUPER_ADMIN et l'adresse madacreaapp@gmail.com.
 */
export async function getCollaborators(where: Prisma.UserWhereInput = {}): Promise<CollaboratorItem[]> {
  try {
    const users = await db.user.findMany({
      where: {
        ...where,
        role: {
          not: UserRole.SUPER_ADMIN,
        },
        email: {
          not: "madacreaapp@gmail.com",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      permissions: (u.permissions as unknown as UserPermissions) || DEFAULT_COLLABORATOR_PERMISSIONS,
      createdAt: u.createdAt,
    }));
  } catch (e) {
    console.warn("Base PostgreSQL hors ligne, utilisation des collaborateurs de test locaux :", e);
    return localDevCollaborators;
  }
}

/**
 * Récupère un collaborateur par son identifiant en garantissant
 * qu'il ne s'agit pas d'un SUPER_ADMIN.
 */
export async function getCollaboratorById(id: string): Promise<CollaboratorItem | null> {
  try {
    const user = await db.user.findFirst({
      where: {
        id,
        role: {
          not: UserRole.SUPER_ADMIN,
        },
        email: {
          not: "madacreaapp@gmail.com",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: (user.permissions as unknown as UserPermissions) || DEFAULT_COLLABORATOR_PERMISSIONS,
      createdAt: user.createdAt,
    };
  } catch (e) {
    console.warn("Base PostgreSQL hors ligne, recherche locale :", e);
    return localDevCollaborators.find((u) => u.id === id) || null;
  }
}
