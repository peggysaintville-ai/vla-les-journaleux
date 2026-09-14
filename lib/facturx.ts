import { CompanySettingsData } from "@/lib/company-settings";

export interface FacturXLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 20, 10, 5.5, 2.1, 0
  totalHT?: number;
  totalTTC?: number;
}

export interface FacturXInvoiceData {
  id: string;
  number: string;
  type: "DEVIS" | "FACTURE";
  operationType: "PRESTATION_SERVICES" | "LIVRAISON_BIENS" | "DROITS_AUTEUR" | string;
  eInvoiceStatus?: string;
  issueDate: Date | string;
  dueDate?: Date | string | null;
  totalAmount: number;
  notes?: string | null;
  items: FacturXLineItem[];
  buyer: {
    name: string;
    entreprise?: string | null;
    email?: string | null;
    telephone?: string | null;
    siren?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
}

/**
 * Formate une date en format UN/CEFACT 102 (AAAAMMJJ)
 */
function formatDate102(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Formate un nombre décimal au format Factur-X standard (2 décimales avec point)
 */
function formatAmount(amount: number): string {
  return Number(amount || 0).toFixed(2);
}

/**
 * Échappe les caractères réservés XML
 */
function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Génère le XML structuré Factur-X (Profil Basic / EN 16931)
 * Conforme à la directive européenne de facturation électronique
 */
export function generateFacturXXml(
  invoice: FacturXInvoiceData,
  company: CompanySettingsData
): string {
  const isInvoice = invoice.type === "FACTURE";
  const typeCode = isInvoice ? "380" : "751"; // 380: Commercial Invoice, 751: Invoice estimate (devis)
  const issueDateStr = formatDate102(invoice.issueDate);
  const dueDateStr = invoice.dueDate ? formatDate102(invoice.dueDate) : issueDateStr;

  // Calcul des lignes et agrégats
  let totalHT = 0;
  let totalTVA = 0;

  const taxesByRate: { [rate: number]: { base: number; tax: number } } = {};

  const linesXml = (invoice.items || []).map((item, index) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRate) || 0;
    const lineHT = qty * price;
    const lineTax = (lineHT * rate) / 100;

    totalHT += lineHT;
    totalTVA += lineTax;

    if (!taxesByRate[rate]) {
      taxesByRate[rate] = { base: 0, tax: 0 };
    }
    taxesByRate[rate].base += lineHT;
    taxesByRate[rate].tax += lineTax;

    return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${index + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXml(item.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${formatAmount(price)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="C62">${qty}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${rate === 0 ? "E" : "S"}</ram:CategoryCode>
          <ram:RateApplicablePercent>${formatAmount(rate)}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${formatAmount(lineHT)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
  }).join("\n");

  const totalTTC = totalHT + totalTVA;

  // Ventilation des taxes
  const taxBreakdownXml = Object.entries(taxesByRate).map(([rateStr, { base, tax }]) => {
    const rate = Number(rateStr);
    const categoryCode = rate === 0 ? "E" : "S";
    const exemptionReason =
      rate === 0
        ? `<ram:ExemptionReason>${escapeXml(
            invoice.operationType === "DROITS_AUTEUR"
              ? "Exonération TVA droits d'auteur / CGI"
              : "TVA non applicable, art. 293 B du CGI"
          )}</ram:ExemptionReason>`
        : "";

    return `      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${formatAmount(tax)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        ${exemptionReason}
        <ram:BasisAmount>${formatAmount(base)}</ram:BasisAmount>
        <ram:CategoryCode>${categoryCode}</ram:CategoryCode>
        <ram:RateApplicablePercent>${formatAmount(rate)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`;
  }).join("\n");

  const sellerSiretClean = (company.siret || "").replace(/\s+/g, "");
  const buyerSirenClean = (invoice.buyer.siren || "").replace(/\s+/g, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice 
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(invoice.number)}</ram:ID>
    <ram:TypeCode>${typeCode}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${issueDateStr}</udt:DateTimeString>
    </ram:IssueDateTime>
    ${
      invoice.notes
        ? `<ram:IncludedNote>
      <ram:Content>${escapeXml(invoice.notes)}</ram:Content>
    </ram:IncludedNote>`
        : ""
    }
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${linesXml}
    <ram:ApplicableHeaderTradeAgreement>
      <!-- Vendeur / Émetteur -->
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(company.legalName || "V'LÀ LES JOURNALEUX SAS")}</ram:Name>
        ${
          sellerSiretClean
            ? `<ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${escapeXml(sellerSiretClean)}</ram:ID>
        </ram:SpecifiedLegalOrganization>`
            : ""
        }
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(company.postalCode || "75011")}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(company.address || "")}</ram:LineOne>
          <ram:CityName>${escapeXml(company.city || "Paris")}</ram:CityName>
          <ram:CountryID>FR</ram:CountryID>
        </ram:PostalTradeAddress>
        ${
          company.vatNumber
            ? `<ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(company.vatNumber.replace(/\s+/g, ""))}</ram:ID>
        </ram:SpecifiedTaxRegistration>`
            : ""
        }
      </ram:SellerTradeParty>

      <!-- Acheteur / Destinataire -->
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(invoice.buyer.entreprise || invoice.buyer.name)}</ram:Name>
        ${
          buyerSirenClean
            ? `<ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${escapeXml(buyerSirenClean)}</ram:ID>
        </ram:SpecifiedLegalOrganization>`
            : ""
        }
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${escapeXml(invoice.buyer.postalCode || "")}</ram:PostcodeCode>
          <ram:LineOne>${escapeXml(invoice.buyer.address || "")}</ram:LineOne>
          <ram:CityName>${escapeXml(invoice.buyer.city || "")}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.buyer.country || "FR")}</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>

    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${issueDateStr}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>

    <ram:ApplicableHeaderTradeSettlement>
      <ram:PaymentReference>${escapeXml(invoice.number)}</ram:PaymentReference>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      
      <!-- Modalité de règlement SEPA -->
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        ${
          company.iban
            ? `<ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${escapeXml(company.iban.replace(/\s+/g, ""))}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>`
            : ""
        }
        ${
          company.bic
            ? `<ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${escapeXml(company.bic.replace(/\s+/g, ""))}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>`
            : ""
        }
      </ram:SpecifiedTradeSettlementPaymentMeans>

${taxBreakdownXml}

      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${dueDateStr}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>

      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${formatAmount(totalHT)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${formatAmount(totalHT)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${formatAmount(totalTVA)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${formatAmount(totalTTC)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${formatAmount(totalTTC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}
