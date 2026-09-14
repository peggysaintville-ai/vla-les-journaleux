import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getCompanySettings } from "@/lib/company-settings";
import { getCollaborators } from "@/lib/users";
import { db } from "@/lib/db";
import SettingsTabs from "@/components/settings-tabs";
import { Settings, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Paramètres & Facturation | V'LÀ LES JOURNALEUX",
  description: "Configuration de l'identité éditoriale, mentions légales, coordonnées bancaires et équipe.",
};

export default async function ParametresPage() {
  const [currentUser, companySettings, collaborators] = await Promise.all([
    getCurrentUser(),
    getCompanySettings(),
    getCollaborators(),
  ]);

  // Récupération de l'avatar en base de données si possible
  let userAvatar: string | null = null;
  if (currentUser?.userId) {
    try {
      const dbUser = await db.user.findUnique({
        where: { id: currentUser.userId },
        select: { avatar: true },
      });
      userAvatar = dbUser?.avatar || null;
    } catch {
      // Ignorer si la base est hors ligne
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Paramètres de la Rédaction
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Identité juridique, mentions de facturation, équipe et profil utilisateur
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary border border-brand-accent/30 text-brand-cream text-xs self-start sm:self-auto font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
          <span>Espace Journaliste Administratrice</span>
        </div>
      </div>

      {/* Système d'onglets */}
      <SettingsTabs
        initialCompanySettings={companySettings}
        collaborators={collaborators}
        currentUser={currentUser}
        userAvatar={userAvatar}
      />
    </div>
  );
}
