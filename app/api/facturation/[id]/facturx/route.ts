import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCompanySettings } from "@/lib/company-settings";
import { generateFacturXXml, FacturXInvoiceData } from "@/lib/facturx";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const invoice = await db.invoiceQuote.findUnique({
      where: { id },
      include: { contact: true },
    });

    if (!invoice) {
      return new NextResponse("Document non trouvé", { status: 404 });
    }

    const companySettings = await getCompanySettings();

    let items = [];
    if (typeof invoice.items === "string") {
      try {
        items = JSON.parse(invoice.items);
      } catch {
        items = [];
      }
    } else if (Array.isArray(invoice.items)) {
      items = invoice.items;
    }

    const invoiceData: FacturXInvoiceData = {
      id: invoice.id,
      number: invoice.number,
      type: invoice.type as "DEVIS" | "FACTURE",
      operationType: invoice.operationType || "PRESTATION_SERVICES",
      eInvoiceStatus: invoice.eInvoiceStatus || "NON_TRANSMISE",
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      totalAmount: Number(invoice.totalAmount),
      notes: invoice.notes,
      items,
      buyer: {
        name: invoice.contact?.nom || "Client Partenaire",
        entreprise: invoice.contact?.entreprise || null,
        email: invoice.contact?.email || null,
        telephone: invoice.contact?.telephone || null,
        siren: invoice.contact?.siren || null,
        country: "FR",
      },
    };

    const xmlContent = generateFacturXXml(invoiceData, companySettings);

    const filename = `factur-x-${invoice.number.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}.xml`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Erreur génération XML Factur-X :", error);
    return new NextResponse(`Erreur génération Factur-X: ${error.message}`, {
      status: 500,
    });
  }
}
