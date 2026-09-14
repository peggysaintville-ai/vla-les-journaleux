import { Metadata } from "next";
import { Calendar, Plus, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Média & Enregistrements | V'LÀ LES JOURNALEUX",
  description: "Calendrier des sessions d'enregistrement, tournages et diffusions.",
};

export default function PlanningPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Planning Média & Tournages
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sessions en studio, reportages de terrain et échéances éditoriales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Planifier une session</span>
          </button>
        </div>
      </div>

      {/* 2. Barre d'indicateurs & Navigation de date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">Septembre 2026</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Studio Audio</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>Reportage Terrain</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Bouclage Presse</span>
          </div>
        </div>
      </div>

      {/* 3. État vide soigné */}
      <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
          <Calendar className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">Aucun événement programmé pour le moment</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Votre agenda est libre cette semaine. Ajoutez vos prochains créneaux d&apos;interviews ou vos jours de tournage extérieur.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream border border-brand-accent/30 text-xs font-semibold transition"
          >
            <Clock className="w-3.5 h-3.5 text-brand-accent" />
            <span>Bloquer un créneau studio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
