import { Metadata } from "next";
import { BarChart3, TrendingUp, Headphones, DollarSign, Award, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Pilotage Chiffre d'Affaires & Audiences | V'LÀ LES JOURNALEUX",
  description: "Tableau de bord financier, suivi des encaissements et statistiques d'écoute.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Pilotage Financier & Audiences
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Évolution du chiffre d&apos;affaires, répartition par prestation et métriques d&apos;impact
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
          <Calendar className="w-3.5 h-3.5 text-brand-accent" />
          <span>Exercice Fiscal 2026</span>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>CA Total Facturé</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">0,00 €</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Objectif T3 : 25 000 €</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Panier Moyen Prestation</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2 450 €</div>
          <div className="text-[11px] text-neutral-500">Forfait standard production</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Auditeurs Mensuels Uniques</span>
            <Headphones className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">38 200</div>
          <div className="text-[11px] text-indigo-400">+14% vs mois précédent</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Taux de conversion devis</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">75%</div>
          <div className="text-[11px] text-neutral-500">Sur les demandes entrantes</div>
        </div>
      </div>

      {/* 3. Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Répartition du Chiffre d&apos;Affaires par Activité</h3>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Production de Podcasts de Marque & Documentaires</span>
                <span className="font-mono font-bold text-brand-accent">55%</span>
              </div>
              <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent rounded-full" style={{ width: "55%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Animation d&apos;Événements, Tables Rondes & Débats</span>
                <span className="font-mono font-bold text-amber-400">30%</span>
              </div>
              <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Pigismes & Grands Reportages Presse Écrite</span>
                <span className="font-mono font-bold text-indigo-400">15%</span>
              </div>
              <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Régime Fiscal</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Franchise en base de TVA (art. 293 B du CGI).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-[11px] text-neutral-400">Plafond annuel BNC :</div>
            <div className="text-base font-bold text-white font-mono">77 700 €</div>
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "22%" }} />
            </div>
            <div className="text-[10px] text-neutral-500">22% du seuil atteint</div>
          </div>
        </div>
      </div>
    </div>
  );
}
