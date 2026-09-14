"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Receipt,
  Download,
  Printer,
  AlertTriangle,
  Sparkles,
  Edit,
} from "lucide-react";
import { convertQuoteToInvoiceAction, updateEInvoiceStatusAction } from "@/app/(app)/facturation/actions";

interface Contact {
  id: string;
  nom: string;
  entreprise?: string | null;
  email?: string | null;
  type: string;
  siren?: string | null;
}

interface InvoiceQuoteItem {
  id: string;
  type: "DEVIS" | "FACTURE";
  number: string;
  status: "BROUILLON" | "ENVOYE" | "PAYE" | "REFUSE" | "ANNULE" | string;
  billingType: string;
  operationType: string;
  eInvoiceStatus: string;
  issueDate: Date | string;
  dueDate?: Date | string | null;
  totalAmount: number | string;
  notes?: string | null;
  contact?: Contact | null;
  items?: any;
}

interface FacturationListProps {
  documents: InvoiceQuoteItem[];
}

export default function FacturationList({ documents }: FacturationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEVIS" | "FACTURE">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [eInvoiceFilter, setEInvoiceFilter] = useState<string>("ALL");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    // Type filter
    if (typeFilter !== "ALL" && doc.type !== typeFilter) return false;

    // Commercial status filter
    if (statusFilter !== "ALL" && doc.status !== statusFilter) return false;

    // E-invoice status filter
    if (eInvoiceFilter !== "ALL" && doc.eInvoiceStatus !== eInvoiceFilter) return false;

    // Search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const numMatch = doc.number.toLowerCase().includes(term);
      const contactNom = doc.contact?.nom?.toLowerCase().includes(term) || false;
      const contactEnt = doc.contact?.entreprise?.toLowerCase().includes(term) || false;
      const notesMatch = doc.notes?.toLowerCase().includes(term) || false;
      if (!numMatch && !contactNom && !contactEnt && !notesMatch) {
        return false;
      }
    }

    return true;
  });

  const handleConvert = async (id: string) => {
    if (!confirm("Voulez-vous convertir ce devis accepté en facture officielle ?")) {
      return;
    }
    setConvertingId(id);
    const res = await convertQuoteToInvoiceAction(id);
    setConvertingId(null);
    if (res.error) {
      alert(`Erreur: ${res.error}`);
    } else {
      window.location.reload();
    }
  };

  const handleEInvoiceChange = async (id: string, newStatus: string) => {
    await updateEInvoiceStatusAction(id, newStatus);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        {/* Recherche textuelle */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par N°, client, média..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-accent transition"
          />
        </div>

        {/* Boutons Type (Tous / Devis / Factures) */}
        <div className="flex items-center gap-1 bg-neutral-950/80 p-1 border border-neutral-800 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "ALL"
                ? "bg-brand-accent text-white shadow-sm shadow-brand-accent/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Tous ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("DEVIS")}
            className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "DEVIS"
                ? "bg-brand-accent text-white shadow-sm shadow-brand-accent/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Devis ({documents.filter((d) => d.type === "DEVIS").length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("FACTURE")}
            className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === "FACTURE"
                ? "bg-brand-accent text-white shadow-sm shadow-brand-accent/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Factures ({documents.filter((d) => d.type === "FACTURE").length})
          </button>
        </div>

        {/* Sélecteurs de statuts */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            aria-label="Statut commercial"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="ENVOYE">Envoyé</option>
            <option value="PAYE">Payé / Validé</option>
            <option value="REFUSE">Refusé</option>
            <option value="ANNULE">Annulé</option>
          </select>

          <select
            aria-label="Statut Factur-X"
            value={eInvoiceFilter}
            onChange={(e) => setEInvoiceFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="ALL">Statut Factur-X</option>
            <option value="NON_TRANSMISE">Non transmise</option>
            <option value="DEPOSEE">Déposée</option>
            <option value="ENCAISSEE">Encaissée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
        </div>
      </div>

      {/* Tableau des documents */}
      {filteredDocs.length > 0 ? (
        <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/90 border-b border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-5 py-3.5">N° / Type</th>
                  <th className="px-5 py-3.5">Destinataire & B2B</th>
                  <th className="px-5 py-3.5">Nature Opération</th>
                  <th className="px-5 py-3.5 text-right">Montant TTC</th>
                  <th className="px-5 py-3.5">Émission / Échéance</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Factur-X</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredDocs.map((doc) => {
                  const isInvoice = doc.type === "FACTURE";
                  const isB2B = doc.contact?.type === "CLIENT_B2B";
                  const missingSiren = isInvoice && isB2B && (!doc.contact?.siren || doc.contact.siren.trim() === "");

                  return (
                    <tr key={doc.id} className="hover:bg-neutral-800/40 transition-colors group">
                      {/* Numéro & Type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isInvoice ? "bg-indigo-400" : "bg-amber-400"
                            }`}
                          />
                          <Link
                            href={`/facturation/${doc.id}`}
                            className="font-mono font-bold text-white group-hover:text-brand-accent transition hover:underline"
                          >
                            {doc.number}
                          </Link>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wide font-mono">
                          {doc.type}
                        </div>
                      </td>

                      {/* Destinataire & Contact B2B */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-neutral-200">
                          {doc.contact?.entreprise || doc.contact?.nom || "Client sans contact"}
                        </div>
                        {doc.contact?.entreprise && doc.contact?.nom && (
                          <div className="text-[11px] text-neutral-400">
                            Attn: {doc.contact.nom}
                          </div>
                        )}

                        {/* Alerte visuelle si SIREN absent sur structure B2B */}
                        {missingSiren && (
                          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>SIREN absent (B2B)</span>
                          </div>
                        )}
                        {!missingSiren && isB2B && doc.contact?.siren && (
                          <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
                            SIREN: {doc.contact.siren}
                          </div>
                        )}
                      </td>

                      {/* Nature d'opération */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            doc.operationType === "DROITS_AUTEUR"
                              ? "bg-purple-950/40 text-purple-300 border-purple-800/60"
                              : doc.operationType === "LIVRAISON_BIENS"
                              ? "bg-blue-950/40 text-blue-300 border-blue-800/60"
                              : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
                          }`}
                        >
                          {doc.operationType === "DROITS_AUTEUR"
                            ? "Droits d'Auteur / Pige"
                            : doc.operationType === "LIVRAISON_BIENS"
                            ? "Livraison de Biens"
                            : "Prestation de Services B2B"}
                        </span>
                      </td>

                      {/* Montant TTC */}
                      <td className="px-5 py-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          {Number(doc.totalAmount || 0).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          €
                        </div>
                      </td>

                      {/* Émission & Échéance */}
                      <td className="px-5 py-4 text-[11px] font-mono text-neutral-400">
                        <div>
                          {new Date(doc.issueDate).toLocaleDateString("fr-FR")}
                        </div>
                        {doc.dueDate && (
                          <div className="text-neutral-500 text-[10px]">
                            Éch. {new Date(doc.dueDate).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </td>

                      {/* Statut Commercial */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            doc.status === "PAYE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : doc.status === "ENVOYE"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : doc.status === "REFUSE"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-neutral-800 text-neutral-400 border-neutral-700"
                          }`}
                        >
                          {doc.status === "PAYE"
                            ? doc.type === "DEVIS"
                              ? "Accepté"
                              : "Payé"
                            : doc.status === "ENVOYE"
                            ? "Envoyé"
                            : doc.status === "REFUSE"
                            ? "Refusé"
                            : "Brouillon"}
                        </span>
                      </td>

                      {/* Statut Factur-X */}
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Statut Factur-X ${doc.number}`}
                          value={doc.eInvoiceStatus || "NON_TRANSMISE"}
                          onChange={(e) => handleEInvoiceChange(doc.id, e.target.value)}
                          className={`text-[10px] font-semibold rounded px-2 py-1 border bg-neutral-950 cursor-pointer focus:outline-none ${
                            doc.eInvoiceStatus === "ENCAISSEE"
                              ? "text-emerald-300 border-emerald-800"
                              : doc.eInvoiceStatus === "DEPOSEE"
                              ? "text-blue-300 border-blue-800"
                              : doc.eInvoiceStatus === "REJETEE"
                              ? "text-rose-300 border-rose-800"
                              : "text-neutral-400 border-neutral-800"
                          }`}
                        >
                          <option value="NON_TRANSMISE">Non transmise</option>
                          <option value="DEPOSEE">Déposée</option>
                          <option value="ENCAISSEE">Encaissée</option>
                          <option value="REJETEE">Rejetée</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Convertir devis en facture */}
                          {doc.type === "DEVIS" && (
                            <button
                              type="button"
                              onClick={() => handleConvert(doc.id)}
                              disabled={convertingId === doc.id}
                              title="Convertir ce devis en facture officielle"
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Télécharger Factur-X XML */}
                          <a
                            href={`/api/facturation/${doc.id}/facturx`}
                            download
                            title="Télécharger Factur-X (XML structuré EN 16931)"
                            className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-accent" />
                          </a>

                          {/* Prévisualiser & Imprimer PDF */}
                          <Link
                            href={`/facturation/${doc.id}/preview`}
                            title="Vue A4 imprimable & PDF"
                            className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-400" />
                          </Link>

                          {/* Éditer */}
                          <Link
                            href={`/facturation/${doc.id}`}
                            title="Modifier le document"
                            className="p-1.5 rounded-lg bg-brand-secondary/70 hover:bg-brand-secondary text-brand-cream border border-brand-accent/20 transition"
                          >
                            <Edit className="w-3.5 h-3.5 text-brand-accentLight" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-neutral-900/30 border border-dashed border-neutral-800 text-center space-y-3">
          <Receipt className="w-8 h-8 text-neutral-600 mx-auto" />
          <div className="text-sm font-semibold text-neutral-300">
            Aucun document ne correspond à vos filtres
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Ajustez votre recherche ou réinitialisez les filtres pour afficher vos devis et factures.
          </p>
        </div>
      )}
    </div>
  );
}
