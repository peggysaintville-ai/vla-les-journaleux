import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getSaaSConfigData } from "./actions";
import SaaSManager from "@/components/saas-manager";
import { ShieldAlert, Server, Layers, Database } from "lucide-react";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Console SaaS & Licences | V'LÀ LES JOURNALEUX",
  description: "Gestion des modules métiers et des licences du SaaS réservée au Super Admin.",
};

export default async function SaasAdminConsolePage() {
  const user = await getCurrentUser();

  // Contrôle strict : Seul le SUPER_ADMIN ou l'adresse réservée a accès, sinon 404 pure
  if (
    !user ||
    (user.role !== UserRole.SUPER_ADMIN &&
      user.email?.toLowerCase().trim() !== "madacreaapp@gmail.com")
  ) {
    notFound();
  }

  const saasConfig = await getSaaSConfigData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. En-tête de la Console Super Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Console <span className="text-indigo-400">Super Admin</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Licence & Modules
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Gestion centrale des licences, expirations et activation des fonctionnalités de la rédaction
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs self-start sm:self-auto font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>Accès Privilégié Système</span>
        </div>
      </div>

      {/* 2. Résumé de l'infrastructure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Environnement</div>
            <div className="text-sm font-bold text-white">PostgreSQL Neon Cloud</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Base de données</div>
            <div className="text-sm font-bold text-white">Prisma PostgreSQL 18</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Sécurité Middleware</div>
            <div className="text-sm font-bold text-white">Edge JWT & RBAC Guard</div>
          </div>
        </div>
      </div>

      {/* 3. Composant de Gestion et Toggles */}
      <SaaSManager
        initialConfig={{
          status: saasConfig.status,
          validUntil: saasConfig.validUntil,
          podcasts: saasConfig.podcasts,
          interviews: saasConfig.interviews,
          facturation: saasConfig.facturation,
          planning: saasConfig.planning,
          crm: saasConfig.crm,
          contrats: saasConfig.contrats,
          analytics: saasConfig.analytics,
        }}
      />
    </div>
  );
}
