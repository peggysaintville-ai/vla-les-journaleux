"use client";

import { useState, useTransition } from "react";
import { updateSaaSConfigAction, simulateStatusAction } from "@/app/(app)/saas/actions";
import { SaaSStatus } from "@prisma/client";
import {
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  Mic2,
  Video,
  Receipt,
  Users,
  FileCheck2,
  BarChart3,
  CalendarDays,
  Lock,
} from "lucide-react";

interface SaaSConfigProps {
  initialConfig: {
    status: SaaSStatus;
    validUntil: Date | string;
    podcasts: boolean;
    interviews: boolean;
    facturation: boolean;
    planning: boolean;
    crm: boolean;
    contrats: boolean;
    analytics: boolean;
  };
}

export default function SaaSManager({ initialConfig }: SaaSConfigProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentStatus, setCurrentStatus] = useState<SaaSStatus>(initialConfig.status);
  const [validUntilDate, setValidUntilDate] = useState(() => {
    const d = new Date(initialConfig.validUntil);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  });

  // Toggles pour chaque module
  const [modules, setModules] = useState({
    podcasts: initialConfig.podcasts,
    interviews: initialConfig.interviews,
    facturation: initialConfig.facturation,
    planning: initialConfig.planning,
    crm: initialConfig.crm,
    contrats: initialConfig.contrats,
    analytics: initialConfig.analytics,
  });

  const handleToggle = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddDays = (days: number) => {
    const d = new Date(validUntilDate);
    d.setDate(d.getDate() + days);
    setValidUntilDate(d.toISOString().split("T")[0]);
  };

  const handleSimulateStatus = (status: SaaSStatus) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await simulateStatusAction(status);
      setCurrentStatus(status);
      if (status === SaaSStatus.ACTIVE) {
        const d = new Date();
        d.setDate(d.getDate() + 365);
        setValidUntilDate(d.toISOString().split("T")[0]);
      } else if (status === SaaSStatus.EXPIRED) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        setValidUntilDate(d.toISOString().split("T")[0]);
      }
      setFeedback({ type: "success", text: res.message });
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("status", currentStatus);
    formData.set("validUntil", validUntilDate);
    Object.entries(modules).forEach(([k, v]) => {
      if (v) formData.set(k, "on");
      else formData.delete(k);
    });

    startTransition(async () => {
      setFeedback(null);
      const res = await updateSaaSConfigAction(formData);
      setFeedback({ type: "success", text: res.message });
    });
  };

  // Calcul des jours restants
  const targetTime = new Date(validUntilDate).getTime();
  const now = new Date().getTime();
  const daysRemaining = Math.max(0, Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24)));

  const MODULE_DEFINITIONS = [
    {
      key: "podcasts" as const,
      label: "Podcasts & Émissions",
      desc: "Pipeline éditorial complet, gestion des flux RSS et épisodes.",
      icon: Mic2,
    },
    {
      key: "interviews" as const,
      label: "Interviews & Tournages",
      desc: "Fiches de cadrage, calendrier des captations et livrables.",
      icon: Video,
    },
    {
      key: "facturation" as const,
      label: "Commercial & Facturation",
      desc: "Édition de devis, facturation, acomptes et catalogue de tarifs.",
      icon: Receipt,
    },
    {
      key: "planning" as const,
      label: "Planning Média & Agenda",
      desc: "Agenda des tournages, interviews et directs radio.",
      icon: CalendarDays,
    },
    {
      key: "crm" as const,
      label: "CRM Contacts & Carnet",
      desc: "Répertoire d'experts, clients B2B, attachés de presse et témoins.",
      icon: Users,
    },
    {
      key: "contrats" as const,
      label: "Contrats & Cessions Droits",
      desc: "Autorisations droit à l'image, cessions d'auteur et accords NDA.",
      icon: FileCheck2,
    },
    {
      key: "analytics" as const,
      label: "Pilotage CA & Audiences",
      desc: "Indicateurs d'écoute, complétion audio et analyse financière.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. CARTE DE STATUT & SIMULATION */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Statut de l&apos;Instance Locale :
              </span>
              {currentStatus === "ACTIVE" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE ({daysRemaining} jours restants)
                </span>
              )}
              {currentStatus === "EXPIRED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono animate-bounce">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  EXPIRED (Accès journaliste bloqué)
                </span>
              )}
              {currentStatus === "SUSPENDED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  SUSPENDED (Interruption administrative)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Clé d&apos;instance : <code className="text-amber-400">LOCAL_DEV_CLIENT_KEY</code> • Échéance :{" "}
              <strong className="text-neutral-200">{validUntilDate}</strong>
            </p>
          </div>

          {/* Boutons de simulation rapide */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline mr-1">
              Simulations :
            </span>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSimulateStatus(SaaSStatus.EXPIRED)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              title="Simuler l'expiration pour tester la redirection vers /abonnement-expire"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Basculer en EXPIRED</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSimulateStatus(SaaSStatus.SUSPENDED)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Suspendre</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSimulateStatus(SaaSStatus.ACTIVE)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Réactiver (365j)</span>
            </button>
          </div>
        </div>

        {/* 2. FORMULAIRE PRINCIPAL (VALIDITÉ & TOGGLES MODULES) */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Section Contrôle de Validité */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Contrôle de la Date de Validité (`validUntil`)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={validUntilDate}
                  onChange={(e) => setValidUntilDate(e.target.value)}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400">Raccourcis :</span>
                <button
                  type="button"
                  onClick={() => handleAddDays(30)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition"
                >
                  +30 jours
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(90)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition"
                >
                  +90 jours
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(365)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition"
                >
                  +1 an (365j)
                </button>
                <button
                  type="button"
                  onClick={() => setValidUntilDate(new Date().toISOString().split("T")[0])}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-rose-400 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Aujourd&apos;hui (Expirer)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Interrupteurs de Fonctionnalités (Feature Toggles) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Interrupteurs de Modules (`SaaSConfig`)</span>
              </div>
              <span className="text-xs text-neutral-400">
                L&apos;activation ou la désactivation prend effet immédiatement sur le dashboard journaliste
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULE_DEFINITIONS.map((mod) => {
                const Icon = mod.icon;
                const isEnabled = modules[mod.key];
                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggle(mod.key)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-4 ${
                      isEnabled
                        ? "bg-neutral-950/70 border-neutral-800 hover:border-amber-400/50"
                        : "bg-neutral-950/30 border-neutral-900 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isEnabled
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-neutral-900 text-neutral-600"
                        }`}
                      >
                        {isEnabled ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{mod.label}</span>
                          {isEnabled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ACTIF
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-500 border border-neutral-800">
                              COUPÉ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle stylisé */}
                    <div
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                        isEnabled ? "bg-amber-400" : "bg-neutral-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-neutral-950 shadow-md transform transition-transform duration-200 ${
                          isEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton de Sauvegarde */}
          <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Les modifications seront répercutées sur les sessions des journalistes</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-400/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Enregistrer la configuration SaaS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
