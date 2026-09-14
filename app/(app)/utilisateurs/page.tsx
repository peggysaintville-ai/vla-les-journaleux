import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCollaborators } from "@/lib/users";
import TeamManager from "@/components/team-manager";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Équipe & Permissions | JournalisteSaaS",
  description: "Gestion des collaborateurs et des droits d'accès par module métier.",
};

export default async function TeamUsersPage() {
  const user = await getCurrentUser();

  // Contrôle d'accès : Seul un JOURNALISTE_ADMIN (ou super admin connecté) accède à cette page
  if (!user || (user.role !== UserRole.JOURNALISTE_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    redirect("/dashboard");
  }

  // Récupération stricte selon la hiérarchie RBAC :
  // - SUPER_ADMIN : voit tous les comptes (Super Admin, Admins, Collaborateurs)
  // - JOURNALISTE_ADMIN : les comptes SUPER_ADMIN sont mathématiquement exclus dès la requête Prisma
  const collaborators = await getCollaborators({}, user.role);

  return (
    <div className="space-y-6">
      <TeamManager
        collaborators={collaborators}
        currentUserRole={user.role}
        currentUserId={user.userId}
      />
    </div>
  );
}
