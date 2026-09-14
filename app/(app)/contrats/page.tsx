import { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, Plus, PenTool, ShieldCheck, Download, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contrats & Cessions de Droits | V'LÀ LES JOURNALEUX",
  description: "Gestion des décharges de droit à l'image, cessions de droits d'auteur et contrats d'enquête.",
};

export default function ContratsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Contrats & Décharges Juridiques
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cessions de droits d&apos;auteur, droit à l&apos;image et accords de confidentialité
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contrats/signature-rapide"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition active:scale-95"
          >
            <PenTool className="w-4 h-4" />
            <span>Faire signer un droit à l&apos;image</span>
          </Link>
        </div>
      </div>

      {/* 2. Cartes d'actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Décharge Droit à l&apos;Image & Témoin</h3>
              <p className="text-xs text-neutral-400">Signature tactile immédiate sur smartphone ou tablette</p>
            </div>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Module de recueil immédiat du consentement pour captation audio, vidéo ou photographie sur le terrain avec horodatage certifié.
          </p>
          <div className="pt-2">
            <Link
              href="/contrats/signature-rapide"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-accent hover:text-brand-accentLight transition"
            >
              <span>Ouvrir l&apos;interface de signature tactile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cession de Droits d&apos;Auteur & Piges</h3>
              <p className="text-xs text-neutral-400">Encadrement de l&apos;exploitation des œuvres sonores</p>
            </div>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Modèles de contrats pour diffuseurs (radio, podcasts payants, plateformes de streaming) avec clause de non-exclusivité.
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le modèle type de cession</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. État vide des contrats archivés */}
      <div className="p-12 sm:p-16 rounded-3xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-primary/80 border border-brand-accent/30 text-brand-accent flex items-center justify-center mx-auto shadow-xl shadow-brand-secondary/40">
          <FileCheck2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">Aucun contrat archivé pour le moment</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Les décharges signées et contrats de cession validés seront centralisés ici avec accès aux preuves numériques.
          </p>
        </div>
      </div>
    </div>
  );
}
