import { Metadata } from "next";
import { Tag, Plus, CheckCircle2, Layers } from "lucide-react";
import { getPublicServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Catalogue de Tarifs & Prestations | V'LÀ LES JOURNALEUX",
  description: "Barème des prestations journalistiques, tarifs d'animation et de réalisation sonore.",
};

export default async function CataloguePage() {
  const services = await getPublicServices();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Catalogue de Tarifs & Prestations
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Barème officiel appliqué aux devis et affiché sur la vitrine publique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>
        </div>
      </div>

      {/* 2. Grille des prestations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-accent/40 transition shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30 font-semibold">
                  {item.unit}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Actif sur le site</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-brand-accentLight transition-colors">
                {item.name}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-800 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-white font-mono">
                  {Number(item.unitPrice).toLocaleString("fr-FR")} €
                </span>
                <span className="text-[11px] text-neutral-500 font-mono ml-1">
                  / {item.unit}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                TVA non applicable (art. 293 B)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
