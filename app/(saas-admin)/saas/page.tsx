import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getSaaSConfigData } from "./actions";
import SaaSManager from "@/components/saas-manager";
import { logoutAction } from "@/app/actions/auth-actions";
import {
  ShieldAlert,
  LogOut,
  Server,
  Layers,
  Database,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SaasAdminConsolePage() {
  const user = await getCurrentUser();

  // Contrôle strict : Seul madacreaapp@gmail.com a accès, sinon 404 pure
  if (!user || user.email?.toLowerCase().trim() !== "madacreaapp@gmail.com") {
    notFound();
  }

  const saasConfig = await getSaaSConfigData();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* 1. Header Administrateur Dédié */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white leading-none">
                  Console <span className="text-indigo-400">Super Admin</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Ghost Console
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Gestion confidentielle des licences et modules SaaS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-neutral-200">{user.name}</div>
              <div className="text-[10px] text-indigo-400 font-mono">{user.email}</div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                id="admin-logout-btn"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-rose-950/40 text-neutral-300 hover:text-rose-300 border border-neutral-800 hover:border-rose-900/50 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 2. Corps de la Console */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Résumé de l'infrastructure locale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Environnement</div>
              <div className="text-sm font-bold text-white">Local 100% Autonome</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Base de données</div>
              <div className="text-sm font-bold text-white">PostgreSQL 16 (Port 5432)</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Sécurité Middleware</div>
              <div className="text-sm font-bold text-white">Edge JWT & SaaS Guard</div>
            </div>
          </div>
        </div>

        {/* Composant de Gestion et Toggles */}
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
      </main>
    </div>
  );
}
