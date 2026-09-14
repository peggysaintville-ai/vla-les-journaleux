import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCompanySettings } from "@/lib/company-settings";
import {
  Printer,
  Download,
  ArrowLeft,
  Edit,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import PrintButton from "@/components/print-button";

export const metadata: Metadata = {
  title: "Prévisualisation Factur-X & Impression | V'LÀ LES JOURNALEUX",
  description: "Vue A4 imprimable et téléchargement du fichier XML Factur-X EN 16931.",
};

export default async function InvoicePreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const doc = await db.invoiceQuote.findUnique({
    where: { id },
    include: { contact: true },
  });

  if (!doc) {
    notFound();
  }

  const company = await getCompanySettings();

  let items = [];
  if (typeof doc.items === "string") {
    try {
      items = JSON.parse(doc.items);
    } catch {
      items = [];
    }
  } else if (Array.isArray(doc.items)) {
    items = doc.items;
  }

  // Calculs financiers
  let totalHT = 0;
  let totalTVA = 0;
  const calculatedItems = items.map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRate) || 0;
    const lineHT = qty * price;
    const lineTVA = (lineHT * rate) / 100;
    totalHT += lineHT;
    totalTVA += lineTVA;
    return {
      id: item.id || `line-${idx}`,
      description: item.description || "Prestation",
      quantity: qty,
      unitPrice: price,
      taxRate: rate,
      totalHT: lineHT,
      totalTTC: lineHT + lineTVA,
    };
  });

  const totalTTC = totalHT + totalTVA;
  const isInvoice = doc.type === "FACTURE";
  const isB2B = doc.contact?.type === "CLIENT_B2B";
  const missingSiren = isInvoice && isB2B && (!doc.contact?.siren || doc.contact.siren.trim() === "");

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Barre d'actions & Contrôles (Masquée à l'impression) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/facturation"
            className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">
                {doc.number}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  isInvoice
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {doc.type}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                Profil Factur-X EN 16931
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Prêt pour impression PDF et dépôt électronique certifié
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Link
            href={`/facturation/${doc.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition"
          >
            <Edit className="w-3.5 h-3.5 text-neutral-400" />
            <span>Modifier</span>
          </Link>

          {/* Bouton Télécharger Factur-X XML */}
          <a
            href={`/api/facturation/${doc.id}/facturx`}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-secondary hover:bg-brand-primary text-brand-cream border border-brand-accent/40 text-xs font-bold transition shadow-md"
            title="Télécharger le fichier XML Factur-X structuré conforme Chorus Pro / PDP"
          >
            <Download className="w-3.5 h-3.5 text-brand-accent" />
            <span>Télécharger Factur-X (XML)</span>
          </a>

          {/* Bouton Imprimer / PDF */}
          <PrintButton />
        </div>
      </div>

      {/* Avertissement visuel si le SIREN manque sur une facture B2B */}
      {missingSiren && (
        <div className="no-print p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200">
            <strong className="font-bold text-rose-100">Conformité B2B :</strong> Ce client est enregistré en tant que structure B2B mais ne dispose pas de numéro SIREN. Le fichier Factur-X sera rejeté par les plateformes de dématérialisation partenaires (PDP). Pensez à l&apos;ajouter dans les paramètres du contact.
          </div>
        </div>
      )}

      {/* 2. FEUILLE FORMAT A4 IMPRIMABLE */}
      <div className="printable-a4 max-w-[820px] mx-auto bg-white text-neutral-900 rounded-2xl shadow-2xl p-8 sm:p-12 font-sans border border-neutral-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
        {/* En-tête : Émetteur & Logo */}
        <div className="flex justify-between items-start border-b border-neutral-200 pb-8 gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-neutral-200 shadow-sm">
              <Image
                src="/logo.jpg"
                alt="Logo V'LÀ LES JOURNALEUX"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-neutral-950 uppercase">
                {company.legalName || "V'LÀ LES JOURNALEUX SAS"}
              </h2>
              {company.tradeName && (
                <div className="text-xs font-semibold text-neutral-600">
                  {company.tradeName}
                </div>
              )}
              <div className="text-[11px] text-neutral-600 leading-relaxed">
                <div>{company.address}</div>
                <div>
                  {company.postalCode} {company.city}, {company.country}
                </div>
                <div>Email : {company.email} | Tél : {company.phone}</div>
              </div>
              <div className="text-[10px] font-mono text-neutral-500 pt-1">
                SIRET : {company.siret || "En cours"} • TVA : {company.vatNumber || "Dispensé"} • APE : {company.apeCode || "9003B"}
              </div>
            </div>
          </div>

          {/* Type de Document & Numérotation */}
          <div className="text-right space-y-1">
            <div className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
              {doc.type === "DEVIS" ? "DEVIS" : "FACTURE"}
            </div>
            <div className="text-sm font-mono font-bold text-brand-primary">
              N° {doc.number}
            </div>
            <div className="text-[11px] text-neutral-600 pt-1 font-mono">
              Date d&apos;émission :{" "}
              <strong className="text-neutral-900">
                {new Date(doc.issueDate).toLocaleDateString("fr-FR")}
              </strong>
            </div>
            {doc.dueDate && (
              <div className="text-[11px] text-neutral-600 font-mono">
                Échéance de paiement :{" "}
                <strong className="text-neutral-900">
                  {new Date(doc.dueDate).toLocaleDateString("fr-FR")}
                </strong>
              </div>
            )}
            <div className="pt-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase">
                Factur-X Standard (EN 16931)
              </span>
            </div>
          </div>
        </div>

        {/* Bloc Destinataire & Donneur d'Ordre */}
        <div className="grid grid-cols-2 gap-8 my-8">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
              Régime de facturation
            </div>
            <div className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 leading-relaxed">
              <strong className="text-neutral-900 block mb-0.5">
                {doc.operationType === "DROITS_AUTEUR"
                  ? "Régime Spécifique : Droits d'Auteur & Pige Presse"
                  : doc.operationType === "LIVRAISON_BIENS"
                  ? "Livraison de Biens Matériels"
                  : "Prestation de Services B2B"}
              </strong>
              {doc.operationType === "DROITS_AUTEUR"
                ? "Titulaire de la Carte d'Identité des Journalistes Professionnels (CCIJP n° 128492). Exploitation presse et radiophonique."
                : "Facturation inter-entreprises soumise aux règles de conformité commerciale et de dématérialisation."}
            </div>
          </div>

          {/* Coordonnées Client */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-1">
              Destinataire / Client
            </div>
            <div className="text-sm font-bold text-neutral-900">
              {doc.contact?.entreprise || doc.contact?.nom || "Client Partenaire"}
            </div>
            {doc.contact?.entreprise && doc.contact?.nom && (
              <div className="text-xs text-neutral-700">
                À l&apos;attention de : {doc.contact.nom}
              </div>
            )}
            {doc.contact?.email && (
              <div className="text-xs text-neutral-600">
                Email : {doc.contact.email}
              </div>
            )}
            {doc.contact?.telephone && (
              <div className="text-xs text-neutral-600">
                Tél : {doc.contact.telephone}
              </div>
            )}
            {doc.contact?.siren ? (
              <div className="text-[11px] font-mono text-neutral-800 pt-1 font-semibold">
                N° SIREN : {doc.contact.siren}
              </div>
            ) : isB2B ? (
              <div className="text-[10px] text-rose-600 font-semibold pt-1">
                ⚠️ SIREN non renseigné
              </div>
            ) : null}
          </div>
        </div>

        {/* Tableau des prestations */}
        <div className="my-8 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/80 border-b border-neutral-200 text-[11px] font-mono uppercase text-neutral-600">
              <tr>
                <th className="px-4 py-3">Description / Prestation</th>
                <th className="px-3 py-3 text-center">Qté</th>
                <th className="px-3 py-3 text-right">Prix Unit. HT</th>
                <th className="px-3 py-3 text-center">Taux TVA</th>
                <th className="px-4 py-3 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60">
              {calculatedItems.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="px-4 py-3.5 font-medium text-neutral-900 leading-snug">
                    {item.description}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-neutral-700">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono text-neutral-700">
                    {Number(item.unitPrice).toFixed(2)} €
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-neutral-600">
                    {item.taxRate}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-neutral-900">
                    {Number(item.totalHT).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux & Règlements */}
        <div className="grid grid-cols-2 gap-8 my-8">
          {/* Coordonnées Bancaires SEPA */}
          <div className="space-y-1.5 text-xs text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="font-bold text-neutral-900 text-xs uppercase font-mono tracking-wider">
              Coordonnées de Règlement (Virement SEPA)
            </div>
            <div className="font-mono text-[11px] pt-1 space-y-0.5">
              <div>
                Banque : <span className="text-neutral-900">{company.bankName || "Banque Postale & Média"}</span>
              </div>
              <div>
                IBAN : <strong className="text-neutral-950 font-bold">{company.iban || "FR76 3000 4012 3456 7890 1234 567"}</strong>
              </div>
              <div>
                BIC : <strong className="text-neutral-950">{company.bic || "BNPAFRPPXXX"}</strong>
              </div>
            </div>
          </div>

          {/* Récapitulatif Chiffré */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-600 pb-1">
              <span>Total Hors Taxes (HT) :</span>
              <span className="font-bold text-neutral-900">{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-neutral-600 pb-1">
              <span>TVA Collectée :</span>
              <span className="font-bold text-neutral-900">{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-black text-neutral-950 pt-2 border-t-2 border-neutral-900">
              <span>TOTAL NET TTC :</span>
              <span className="text-brand-primary">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Mentions Légales Obligatoires (CGI, Presse, Pénalités de retard) */}
        <div className="border-t border-neutral-200 pt-6 mt-8 space-y-2 text-[10px] text-neutral-500 leading-relaxed">
          <div className="font-semibold text-neutral-700">
            Mentions Légales & Conditions de Vente :
          </div>
          <div className="whitespace-pre-line text-justify">
            {doc.notes || company.legalNoticeInvoice || `Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) en application de l'article L. 123-1-1 du code de commerce.
TVA non applicable, art. 293 B du Code Général des Impôts (ou taux réduit presse 2,1% selon nature des droits cédés).
Titulaire de la Carte d'Identité des Journalistes Professionnels (CCIJP) n° 128492.
Règlement à 30 jours date d'émission de facture par virement bancaire. Tout retard entraîne l'application d'une pénalité forfaitaire légale de 40 € pour frais de recouvrement.`}
          </div>
          <div className="pt-2 text-center text-[9px] text-neutral-400 font-mono">
            Document généré et certifié selon la norme européenne EN 16931 / Factur-X Profil Basic.
          </div>
        </div>
      </div>

      {/* Styles d'impression CSS injectés */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print {
              display: none !important;
            }
            aside {
              display: none !important;
            }
            header {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
            }
            .printable-a4 {
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `,
      }} />
    </div>
  );
}
