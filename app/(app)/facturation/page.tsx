import { Metadata } from "next";
import Link from "next/link";
import {
  Receipt,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Settings,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/db";
import FacturationList from "@/components/facturation-list";

export const metadata: Metadata = {
  title: "Commercial, Devis & Facturation Factur-X | V'LÀ LES JOURNALEUX",
  description: "Gestion des devis éditoriaux, factures conformes Factur-X, suivi des encaissements et TVA presse.",
};

export default async function FacturationPage() {
  let documents: any[] = [];
  try {
    documents = await db.invoiceQuote.findMany({
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Base locale hors ligne lors de la récupération des factures :", err);
    documents = [];
  }

  // Calculs des indicateurs financiers clés
  let caEncaisse = 0;
  let facturesEnAttente = 0;
  let countFacturesEnAttente = 0;
  let devisRelance = 0;
  let countDevisRelance = 0;
  let b2bMissingSirenCount = 0;

  documents.forEach((doc) => {
    const amount = Number(doc.totalAmount) || 0;
    if (doc.type === "FACTURE") {
      if (doc.status === "PAYE") {
        caEncaisse += amount;
      } else if (doc.status === "ENVOYE" || doc.status === "BROUILLON") {
        facturesEnAttente += amount;
        countFacturesEnAttente += 1;
      }

      // Contrôle conformité B2B Factur-X
      if (
        doc.contact?.type === "CLIENT_B2B" &&
        (!doc.contact?.siren || doc.contact.siren.trim() === "")
      ) {
        b2bMissingSirenCount += 1;
      }
    } else if (doc.type === "DEVIS") {
      if (doc.status === "ENVOYE" || doc.status === "BROUILLON") {
        devisRelance += amount;
        countDevisRelance += 1;
      }
    }
  });

  const formattedDocuments = documents.map((d) => ({
    ...d,
    totalAmount: Number(d.totalAmount),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. En-tête & Actions Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Commercial, Devis & Facturation
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-accent/20 text-brand-accentLight border border-brand-accent/40 font-bold">
                Conforme Factur-X
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Émission de devis, facturation électronique structurée (EN 16931) et pige de presse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link
            href="/parametres"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
          >
            <Settings className="w-4 h-4 text-brand-accent" />
            <span className="hidden sm:inline">Coordonnées & SIRET</span>
          </Link>

          <Link
            href="/facturation/nouveau?type=DEVIS"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream border border-brand-accent/40 text-xs font-bold shadow-md transition"
          >
            <FileText className="w-4 h-4 text-brand-accent" />
            <span>Nouveau Devis</span>
          </Link>

          <Link
            href="/facturation/nouveau?type=FACTURE"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </Link>
        </div>
      </div>

      {/* Alerte B2B globale si un SIREN manque */}
      {b2bMissingSirenCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-100">
              {b2bMissingSirenCount} facture(s) B2B sans numéro SIREN :
            </span>{" "}
            Pour respecter l'obligation de facturation électronique Factur-X en France, chaque structure B2B doit comporter un numéro SIREN valide. Vous pouvez renseigner ce numéro directement sur la fiche du client.
          </div>
        </div>
      )}

      {/* 2. Indicateurs Financiers Clés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CA Encaissé */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Chiffre d&apos;affaires encaissé</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {caEncaisse.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
          <div className="text-[11px] text-neutral-500">
            Factures acquittées (TVA et droits d&apos;auteur inclus)
          </div>
        </div>

        {/* Factures en attente */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Factures en attente de paiement</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {facturesEnAttente.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
          <div className="text-[11px] text-neutral-500">
            {countFacturesEnAttente} facture(s) émise(s) à recouvrer
          </div>
        </div>

        {/* Devis à relancer */}
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Devis en cours & à relancer</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {devisRelance.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
          <div className="text-[11px] text-neutral-500">
            {countDevisRelance} proposition(s) en attente de validation client
          </div>
        </div>
      </div>

      {/* 3. Liste et Filtrage des Devis / Factures */}
      <FacturationList documents={formattedDocuments} />
    </div>
  );
}
