import { Metadata } from "next";
import { db } from "@/lib/db";
import InvoiceQuoteForm from "@/components/invoice-quote-form";

export const metadata: Metadata = {
  title: "Nouveau Document Commercial | V'LÀ LES JOURNALEUX",
  description: "Création d'un devis ou d'une facture conforme Factur-X & presse.",
};

export default async function NouveauDocumentPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const defaultType =
    searchParams.type === "FACTURE" ? "FACTURE" : "DEVIS";

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
    console.warn("Base locale hors ligne lors de la création :", err);
  }

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
        contacts={formattedContacts}
        services={formattedServices}
        defaultType={defaultType}
      />
    </div>
  );
}
