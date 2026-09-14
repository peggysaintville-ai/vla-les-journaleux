import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import InvoiceQuoteForm from "@/components/invoice-quote-form";

export const metadata: Metadata = {
  title: "Modifier Document Commercial | V'LÀ LES JOURNALEUX",
  description: "Édition et conversion d'un devis ou facture.",
};

export default async function EditDocumentPage(props: {
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

  let contacts: any[] = [];
  let services: any[] = [];

  try {
    contacts = await db.contact.findMany({
      orderBy: { nom: "asc" },
    });
    services = await db.serviceCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.warn("Base de données non joignable :", err);
  }

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

  const formattedDoc = {
    id: doc.id,
    type: doc.type as "DEVIS" | "FACTURE",
    number: doc.number,
    status: doc.status,
    operationType: doc.operationType || "PRESTATION_SERVICES",
    billingType: doc.billingType,
    eInvoiceStatus: doc.eInvoiceStatus || "NON_TRANSMISE",
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    notes: doc.notes,
    contactId: doc.contactId,
    items,
  };

  const formattedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    unitPrice: Number(s.unitPrice),
    unit: s.unit,
  }));

  const formattedContacts = contacts.map((c) => ({
    id: c.id,
    nom: c.nom,
    entreprise: c.entreprise,
    email: c.email,
    type: c.type,
    siren: c.siren,
  }));

  return (
    <div className="max-w-5xl mx-auto py-4">
      <InvoiceQuoteForm
        initialData={formattedDoc}
        contacts={formattedContacts}
        services={formattedServices}
      />
    </div>
  );
}
