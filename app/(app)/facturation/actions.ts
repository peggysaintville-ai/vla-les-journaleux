"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalHT?: number;
  totalTTC?: number;
}

export interface FacturationActionResult {
  success?: boolean;
  error?: string;
  id?: string;
  number?: string;
}

/**
 * Génère un numéro séquentiel DEV-AAAA-XXX ou FACT-AAAA-XXX
 */
async function generateDocumentNumber(type: "DEVIS" | "FACTURE"): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = type === "DEVIS" ? `DEV-${currentYear}-` : `FACT-${currentYear}-`;

  const count = await db.invoiceQuote.count({
    where: {
      number: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(count + 1).padStart(3, "0");
  return `${prefix}${nextSeq}`;
}

/**
 * Créer un devis ou une facture
 */
export async function createInvoiceQuoteAction(
  formData: FormData
): Promise<FacturationActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié. Veuillez vous reconnecter." };
  }

  try {
    const type = (formData.get("type") as "DEVIS" | "FACTURE") || "DEVIS";
    const contactId = (formData.get("contactId") as string) || null;
    const operationType =
      (formData.get("operationType") as string) || "PRESTATION_SERVICES";
    const billingType =
      (formData.get("billingType") as "PRESTATION_B2B" | "DROITS_AUTEUR" | "PIGE") ||
      (operationType === "DROITS_AUTEUR" ? "DROITS_AUTEUR" : "PRESTATION_B2B");
    const issueDateRaw = formData.get("issueDate") as string;
    const dueDateRaw = formData.get("dueDate") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;
    const itemsRaw = formData.get("items") as string;

    let items: InvoiceLineItem[] = [];
    try {
      items = itemsRaw ? JSON.parse(itemsRaw) : [];
    } catch {
      items = [];
    }

    if (items.length === 0) {
      return { error: "Veuillez ajouter au moins une ligne de prestation." };
    }

    // Calcul du total
    let totalHT = 0;
    let totalTVA = 0;
    const calculatedItems = items.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRate) || 0;
      const lineHT = qty * price;
      const lineTVA = (lineHT * rate) / 100;
      totalHT += lineHT;
      totalTVA += lineTVA;
      return {
        id: item.id || `item-${idx + 1}`,
        description: item.description || "Prestation",
        quantity: qty,
        unitPrice: price,
        taxRate: rate,
        totalHT: lineHT,
        totalTTC: lineHT + lineTVA,
      };
    });

    const totalTTC = totalHT + totalTVA;
    const docNumber = await generateDocumentNumber(type);

    const created = await db.invoiceQuote.create({
      data: {
        number: docNumber,
        type,
        status: "BROUILLON",
        billingType,
        operationType,
        eInvoiceStatus: "NON_TRANSMISE",
        issueDate: issueDateRaw ? new Date(issueDateRaw) : new Date(),
        dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
        totalAmount: totalTTC,
        items: calculatedItems,
        notes,
        contactId,
      },
    });

    revalidatePath("/facturation");
    return { success: true, id: created.id, number: created.number };
  } catch (err: any) {
    console.error("Erreur createInvoiceQuoteAction :", err);
    return { error: err.message || "Erreur lors de la création du document." };
  }
}

/**
 * Mettre à jour un devis ou une facture existante
 */
export async function updateInvoiceQuoteAction(
  id: string,
  formData: FormData
): Promise<FacturationActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  try {
    const contactId = (formData.get("contactId") as string) || null;
    const operationType =
      (formData.get("operationType") as string) || "PRESTATION_SERVICES";
    const billingType =
      (formData.get("billingType") as "PRESTATION_B2B" | "DROITS_AUTEUR" | "PIGE") ||
      "PRESTATION_B2B";
    const status = (formData.get("status") as any) || "BROUILLON";
    const eInvoiceStatus = (formData.get("eInvoiceStatus") as string) || "NON_TRANSMISE";
    const issueDateRaw = formData.get("issueDate") as string;
    const dueDateRaw = formData.get("dueDate") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;
    const itemsRaw = formData.get("items") as string;

    let items: InvoiceLineItem[] = [];
    try {
      items = itemsRaw ? JSON.parse(itemsRaw) : [];
    } catch {
      items = [];
    }

    let totalHT = 0;
    let totalTVA = 0;
    const calculatedItems = items.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRate) || 0;
      const lineHT = qty * price;
      const lineTVA = (lineHT * rate) / 100;
      totalHT += lineHT;
      totalTVA += lineTVA;
      return {
        id: item.id || `item-${idx + 1}`,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        taxRate: rate,
        totalHT: lineHT,
        totalTTC: lineHT + lineTVA,
      };
    });

    const totalTTC = totalHT + totalTVA;

    await db.invoiceQuote.update({
      where: { id },
      data: {
        contactId,
        operationType,
        billingType,
        status,
        eInvoiceStatus,
        issueDate: issueDateRaw ? new Date(issueDateRaw) : undefined,
        dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
        totalAmount: totalTTC,
        items: calculatedItems,
        notes,
      },
    });

    revalidatePath("/facturation");
    revalidatePath(`/facturation/${id}`);
    revalidatePath(`/facturation/${id}/preview`);
    return { success: true };
  } catch (err: any) {
    console.error("Erreur updateInvoiceQuoteAction :", err);
    return { error: err.message || "Erreur lors de la mise à jour." };
  }
}

/**
 * Conversion en 1 clic d'un devis accepté en facture officielle
 */
export async function convertQuoteToInvoiceAction(
  quoteId: string
): Promise<FacturationActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Non authentifié." };
  }

  try {
    const quote = await db.invoiceQuote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return { error: "Devis introuvable." };
    }

    if (quote.type === "FACTURE") {
      return { error: "Ce document est déjà une facture." };
    }

    const newNumber = await generateDocumentNumber("FACTURE");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Échéance standard à 30 jours

    const invoice = await db.invoiceQuote.create({
      data: {
        number: newNumber,
        type: "FACTURE",
        status: "ENVOYE",
        billingType: quote.billingType,
        operationType: quote.operationType,
        eInvoiceStatus: "NON_TRANSMISE",
        issueDate: new Date(),
        dueDate,
        totalAmount: quote.totalAmount,
        items: quote.items as any,
        notes: `Facture issue de la validation du devis ${quote.number}.${
          quote.notes ? `\n${quote.notes}` : ""
        }`,
        contactId: quote.contactId,
      },
    });

    // Mettre à jour le devis d'origine comme accepté/payé
    await db.invoiceQuote.update({
      where: { id: quoteId },
      data: { status: "PAYE" },
    });

    revalidatePath("/facturation");
    return { success: true, id: invoice.id, number: invoice.number };
  } catch (err: any) {
    console.error("Erreur convertQuoteToInvoiceAction :", err);
    return { error: err.message || "Erreur lors de la conversion en facture." };
  }
}

/**
 * Mise à jour rapide du statut électronique Factur-X
 */
export async function updateEInvoiceStatusAction(
  id: string,
  eInvoiceStatus: string
): Promise<FacturationActionResult> {
  try {
    await db.invoiceQuote.update({
      where: { id },
      data: { eInvoiceStatus },
    });
    revalidatePath("/facturation");
    revalidatePath(`/facturation/${id}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erreur lors du changement de statut." };
  }
}

/**
 * Suppression d'un document
 */
export async function deleteInvoiceQuoteAction(
  id: string
): Promise<FacturationActionResult> {
  try {
    await db.invoiceQuote.delete({
      where: { id },
    });
    revalidatePath("/facturation");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression." };
  }
}
