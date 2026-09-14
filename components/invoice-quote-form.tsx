"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Receipt,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Save,
} from "lucide-react";
import {
  createInvoiceQuoteAction,
  updateInvoiceQuoteAction,
  convertQuoteToInvoiceAction,
  InvoiceLineItem,
} from "@/app/(app)/facturation/actions";

interface Contact {
  id: string;
  nom: string;
  entreprise?: string | null;
  email?: string | null;
  type: string;
  siren?: string | null;
}

interface ServiceItem {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
}

interface InvoiceQuoteFormProps {
  initialData?: {
    id: string;
    type: "DEVIS" | "FACTURE";
    number: string;
    status: string;
    operationType: string;
    billingType: string;
    eInvoiceStatus: string;
    issueDate: Date | string;
    dueDate?: Date | string | null;
    notes?: string | null;
    contactId?: string | null;
    items: InvoiceLineItem[];
  };
  contacts: Contact[];
  services: ServiceItem[];
  defaultType?: "DEVIS" | "FACTURE";
}

export default function InvoiceQuoteForm({
  initialData,
  contacts,
  services,
  defaultType = "DEVIS",
}: InvoiceQuoteFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  // États du formulaire
  const [docType, setDocType] = useState<"DEVIS" | "FACTURE">(
    initialData?.type || defaultType
  );
  const [operationType, setOperationType] = useState<string>(
    initialData?.operationType || "PRESTATION_SERVICES"
  );
  const [contactId, setContactId] = useState<string>(
    initialData?.contactId || (contacts[0]?.id ?? "")
  );
  const [status, setStatus] = useState<string>(
    initialData?.status || "BROUILLON"
  );
  const [eInvoiceStatus, setEInvoiceStatus] = useState<string>(
    initialData?.eInvoiceStatus || "NON_TRANSMISE"
  );
  const [issueDate, setIssueDate] = useState<string>(
    initialData?.issueDate
      ? new Date(initialData.issueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
  );
  const [notes, setNotes] = useState<string>(
    initialData?.notes ||
      (operationType === "DROITS_AUTEUR"
        ? "Cession de droits d'auteur pour exploitation presse et podcast. Titulaire de la carte de presse CCIJP n° 128492. TVA non applicable (art. 293 B CGI)."
        : "Règlement par virement bancaire sous 30 jours date d'émission.")
  );

  // Lignes de facturation
  const [items, setItems] = useState<InvoiceLineItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [
          {
            id: "line-1",
            description: services[0]?.name || "Prestation éditoriale et podcast",
            quantity: 1,
            unitPrice: services[0]?.unitPrice || 1200,
            taxRate: operationType === "DROITS_AUTEUR" ? 0 : 20,
          },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Contact sélectionné
  const selectedContact = contacts.find((c) => c.id === contactId);
  const isB2B = selectedContact?.type === "CLIENT_B2B";
  const missingSiren = isB2B && (!selectedContact?.siren || selectedContact.siren.trim() === "");

  // Calculs dynamiques
  const calculatedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRate) || 0;
    const ht = qty * price;
    const tva = (ht * rate) / 100;
    return {
      ...item,
      totalHT: ht,
      totalTTC: ht + tva,
    };
  });

  const totalHT = calculatedItems.reduce((acc, curr) => acc + (curr.totalHT || 0), 0);
  const totalTVA = calculatedItems.reduce(
    (acc, curr) => acc + ((curr.totalTTC || 0) - (curr.totalHT || 0)),
    0
  );
  const totalTTC = totalHT + totalTVA;

  // Manipulation des lignes
  const handleAddItem = () => {
    const defaultTax = operationType === "DROITS_AUTEUR" ? 0 : 20;
    setItems((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: defaultTax,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSelectService = (index: number, serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    if (!srv) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              description: srv.name,
              unitPrice: srv.unitPrice,
            }
          : item
      )
    );
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("type", docType);
    formData.append("contactId", contactId);
    formData.append("operationType", operationType);
    formData.append(
      "billingType",
      operationType === "DROITS_AUTEUR" ? "DROITS_AUTEUR" : "PRESTATION_B2B"
    );
    formData.append("status", status);
    formData.append("eInvoiceStatus", eInvoiceStatus);
    formData.append("issueDate", issueDate);
    formData.append("dueDate", dueDate);
    formData.append("notes", notes);
    formData.append("items", JSON.stringify(items));

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updateInvoiceQuoteAction(initialData.id, formData);
      } else {
        res = await createInvoiceQuoteAction(formData);
      }

      if (res.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else {
        router.push("/facturation");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement.");
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!initialData?.id) return;
    if (!confirm("Voulez-vous convertir ce devis en facture officielle ?")) return;
    setLoading(true);
    const res = await convertQuoteToInvoiceAction(initialData.id);
    if (res.error) {
      alert(`Erreur: ${res.error}`);
      setLoading(false);
    } else {
      router.push(`/facturation/${res.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
      {/* Barre d'action supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href="/facturation"
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing ? (
                <>
                  <span>Modifier {initialData?.number}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                    {docType}
                  </span>
                </>
              ) : (
                `Créer un nouveau document commercial`
              )}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Conforme à la norme Factur-X (EN 16931) et aux mentions de la presse indépendante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Conversion Devis -> Facture en 1 clic */}
          {isEditing && docType === "DEVIS" && (
            <button
              type="button"
              onClick={handleConvert}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-bold transition shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Convertir en Facture</span>
            </button>
          )}

          {isEditing && (
            <Link
              href={`/facturation/${initialData?.id}/preview`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
            >
              <span>Prévisualiser A4 / Factur-X</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Enregistrement..." : "Enregistrer le document"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Bascule Devis vs Facture & Type d'Opération */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl">
        {/* Bascule Devis / Facture */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Nature du document
          </label>
          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setDocType("DEVIS")}
              className={`py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                docType === "DEVIS"
                  ? "bg-brand-accent text-white shadow-md shadow-brand-accent/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Devis Électoral / Devis</span>
            </button>
            <button
              type="button"
              onClick={() => setDocType("FACTURE")}
              className={`py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                docType === "FACTURE"
                  ? "bg-brand-accent text-white shadow-md shadow-brand-accent/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Facture Conforme</span>
            </button>
          </div>
        </div>

        {/* Sélecteur de type d'opération */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Régime & Type d&apos;Opération (Factur-X)
          </label>
          <select
            value={operationType}
            onChange={(e) => {
              const val = e.target.value;
              setOperationType(val);
              if (val === "DROITS_AUTEUR") {
                // Par défaut, TVA 0% ou dispense
                setItems((prev) => prev.map((item) => ({ ...item, taxRate: 0 })));
              } else if (val === "PRESTATION_SERVICES") {
                setItems((prev) => prev.map((item) => ({ ...item, taxRate: 20 })));
              }
            }}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="PRESTATION_SERVICES">
              Prestation de Services B2B (TVA standard 20% ou exonération)
            </option>
            <option value="DROITS_AUTEUR">
              Droits d&apos;Auteur & Pige Éditoriale (Régime Presse / Art. 293 B CGI)
            </option>
            <option value="LIVRAISON_BIENS">
              Livraison de Biens (Matériel, supports physiques)
            </option>
          </select>

          {/* Mentions contextuelles selon le type d'opération */}
          <div className="text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed">
            {operationType === "DROITS_AUTEUR" ? (
              <span className="text-purple-300 font-medium">
                ⚖️ <strong>Régime Droits d&apos;Auteur & Presse :</strong> Mention légale obligatoire « Carte CCIJP n° 128492 » et dispense de TVA ou taux réduit presse (2,1%) automatiquement reportés sur le XML Factur-X.
              </span>
            ) : (
              <span className="text-emerald-300 font-medium">
                🏢 <strong>Prestation B2B standard :</strong> Soumis aux règles de conformité inter-entreprises. Nécessite le SIREN du donneur d&apos;ordre pour dépôt sur les plateformes agréées (PDP / Chorus Pro).
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Destinataire, Dates et Statuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl">
        {/* Choix du contact */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Destinataire / Client
          </label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
          >
            <option value="">Sélectionner un contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.entreprise ? `${c.entreprise} (${c.nom})` : c.nom} [
                {c.type === "CLIENT_B2B" ? "B2B" : c.type}]
              </option>
            ))}
          </select>

          {/* Avertissement SIREN manquant sur B2B */}
          {missingSiren && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>
                Attention : ce client B2B n&apos;a pas de numéro SIREN.
              </span>
            </div>
          )}
          {!missingSiren && isB2B && selectedContact?.siren && (
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>SIREN valide : {selectedContact.siren}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Date d&apos;émission & Échéance
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">Date émission</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">Échéance paiement</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
              />
            </div>
          </div>
        </div>

        {/* Statuts */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Statut Commercial & Statut e-Facture
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">Commercial</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                <option value="BROUILLON">Brouillon</option>
                <option value="ENVOYE">Envoyé</option>
                <option value="PAYE">Payé / Validé</option>
                <option value="REFUSE">Refusé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block mb-0.5">Factur-X</span>
              <select
                value={eInvoiceStatus}
                onChange={(e) => setEInvoiceStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                <option value="NON_TRANSMISE">Non transmise</option>
                <option value="DEPOSEE">Déposée</option>
                <option value="ENCAISSEE">Encaissée</option>
                <option value="REJETEE">Rejetée</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lignes de Prestations (Catalogue & Saisie libre) */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Lignes de prestations & articles</h3>
            <p className="text-xs text-neutral-400">
              Associez des prestations du catalogue de tarifs ou saisissez des libellés libres
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream border border-brand-accent/40 text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-brand-accent" />
            <span>Ajouter une ligne</span>
          </button>
        </div>

        {/* En-tête du tableau des lignes */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const lineHT = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
            const lineTTC = lineHT + (lineHT * (Number(item.taxRate) || 0)) / 100;

            return (
              <div
                key={item.id || index}
                className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-3 group hover:border-neutral-700 transition"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  {/* Sélecteur de catalogue rapide */}
                  <div className="w-full md:w-56">
                    <span className="text-[10px] text-neutral-500 block mb-1">
                      Préremplir du catalogue
                    </span>
                    <select
                      onChange={(e) => handleSelectService(index, e.target.value)}
                      defaultValue=""
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                    >
                      <option value="" disabled>
                        Choisir une prestation...
                      </option>
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.unitPrice} €)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description / Libellé */}
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-neutral-500 block mb-1">
                      Désignation / Description
                    </span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(index, "description", e.target.value)
                      }
                      placeholder="Ex: Production & réalisation d'épisode de podcast"
                      required
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  {/* Quantité */}
                  <div className="w-20">
                    <span className="text-[10px] text-neutral-500 block mb-1">Qté</span>
                    <input
                      type="number"
                      min="0.5"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(index, "quantity", Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
                    />
                  </div>

                  {/* Prix Unitaire HT */}
                  <div className="w-28">
                    <span className="text-[10px] text-neutral-500 block mb-1">Prix U. HT (€)</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(index, "unitPrice", Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
                    />
                  </div>

                  {/* Taux TVA */}
                  <div className="w-28">
                    <span className="text-[10px] text-neutral-500 block mb-1">Taux TVA</span>
                    <select
                      value={item.taxRate}
                      onChange={(e) =>
                        handleUpdateItem(index, "taxRate", Number(e.target.value))
                      }
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
                    >
                      <option value="0">0% (Art. 293B)</option>
                      <option value="2.1">2.1% (Presse)</option>
                      <option value="5.5">5.5% (Réduit)</option>
                      <option value="10">10% (Intermédiaire)</option>
                      <option value="20">20% (Normal)</option>
                    </select>
                  </div>

                  {/* Total Ligne TTC */}
                  <div className="w-28 text-right">
                    <span className="text-[10px] text-neutral-500 block mb-1">Total TTC</span>
                    <div className="py-1.5 text-xs font-mono font-bold text-white">
                      {lineTTC.toFixed(2)} €
                    </div>
                  </div>

                  {/* Bouton Supprimer */}
                  <div className="pt-4 md:pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      title="Supprimer la ligne"
                      className="p-1.5 text-neutral-500 hover:text-rose-400 disabled:opacity-20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Récapitulatif Financier HT / TVA / TTC */}
        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <div className="w-full sm:w-80 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Total Hors Taxes (HT) :</span>
              <span className="font-bold text-white">{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Montant TVA :</span>
              <span className="font-bold text-neutral-300">{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
              <span className="text-brand-accent">Total Net TTC :</span>
              <span className="text-brand-accent font-extrabold">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mentions Légales & Notes de Facturation */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 shadow-xl">
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
          Mentions Légales & Notes particulières (reportées sur le PDF & Factur-X)
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Précisez les conditions de règlement, dispense de TVA, article du CGI ou cession de droits..."
          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-accent leading-relaxed"
        />
      </div>
    </form>
  );
}
