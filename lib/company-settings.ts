import { db } from "@/lib/db";

export interface CompanySettingsData {
  id?: string;
  legalName: string;
  tradeName: string;
  siret: string;
  vatNumber: string;
  apeCode: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  websiteUrl: string;
  iban: string;
  bic: string;
  bankName: string;
  legalNoticeInvoice: string;
  updatedAt?: Date;
}

let localSettingsStore: CompanySettingsData = {
  id: "settings-default",
  legalName: "Peggy SAINT-VILLE",
  tradeName: "V'là les journaleux",
  siret: "",
  vatNumber: "Non assujetti (Franchise en base)",
  apeCode: "6399Z",
  address: "Cité les Hauts du Port, Bâtiment Eiffel, Appt 158",
  postalCode: "97200",
  city: "Fort-de-France",
  country: "France",
  email: "peggy.saintville@gmail.com",
  phone: "+596 696 03 84 78",
  websiteUrl: "https://vlalesjournaleux.fr",
  iban: "FR76 3000 4012 3456 7890 1234 567",
  bic: "BNPAFRPPXXX",
  bankName: "Banque Postale & Média",
  legalNoticeInvoice: "TVA non applicable, art. 293 B du CGI - Micro-entreprise - Dispense d'immatriculation au RCS et au RM.",
  updatedAt: new Date(),
};

export async function getCompanySettings(): Promise<CompanySettingsData> {
  try {
    const settings = await db.companySettings.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (settings) {
      return {
        id: settings.id,
        legalName: settings.legalName,
        tradeName: settings.tradeName || "",
        siret: settings.siret || "",
        vatNumber: settings.vatNumber || "",
        apeCode: settings.apeCode || "",
        address: settings.address || "",
        postalCode: settings.postalCode || "",
        city: settings.city || "",
        country: settings.country || "France",
        email: settings.email || "",
        phone: settings.phone || "",
        websiteUrl: settings.websiteUrl || "",
        iban: settings.iban || "",
        bic: settings.bic || "",
        bankName: settings.bankName || "",
        legalNoticeInvoice: settings.legalNoticeInvoice || "",
        updatedAt: settings.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour CompanySettings, utilisation du fallback :", err);
  }

  return localSettingsStore;
}

export async function updateCompanySettings(data: Partial<CompanySettingsData>): Promise<CompanySettingsData> {
  try {
    const existing = await db.companySettings.findFirst();
    if (existing) {
      const updated = await db.companySettings.update({
        where: { id: existing.id },
        data: {
          legalName: data.legalName ?? existing.legalName,
          tradeName: data.tradeName ?? existing.tradeName,
          siret: data.siret ?? existing.siret,
          vatNumber: data.vatNumber ?? existing.vatNumber,
          apeCode: data.apeCode ?? existing.apeCode,
          address: data.address ?? existing.address,
          postalCode: data.postalCode ?? existing.postalCode,
          city: data.city ?? existing.city,
          country: data.country ?? existing.country,
          email: data.email ?? existing.email,
          phone: data.phone ?? existing.phone,
          websiteUrl: data.websiteUrl ?? existing.websiteUrl,
          iban: data.iban ?? existing.iban,
          bic: data.bic ?? existing.bic,
          bankName: data.bankName ?? existing.bankName,
          legalNoticeInvoice: data.legalNoticeInvoice ?? existing.legalNoticeInvoice,
        },
      });
      return {
        id: updated.id,
        legalName: updated.legalName,
        tradeName: updated.tradeName || "",
        siret: updated.siret || "",
        vatNumber: updated.vatNumber || "",
        apeCode: updated.apeCode || "",
        address: updated.address || "",
        postalCode: updated.postalCode || "",
        city: updated.city || "",
        country: updated.country || "France",
        email: updated.email || "",
        phone: updated.phone || "",
        websiteUrl: updated.websiteUrl || "",
        iban: updated.iban || "",
        bic: updated.bic || "",
        bankName: updated.bankName || "",
        legalNoticeInvoice: updated.legalNoticeInvoice || "",
        updatedAt: updated.updatedAt,
      };
    } else {
      const created = await db.companySettings.create({
        data: {
          legalName: data.legalName || "V'LÀ LES JOURNALEUX SAS",
          tradeName: data.tradeName || "V'LÀ LES JOURNALEUX",
          siret: data.siret || "",
          vatNumber: data.vatNumber || "",
          apeCode: data.apeCode || "",
          address: data.address || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          country: data.country || "France",
          email: data.email || "",
          phone: data.phone || "",
          websiteUrl: data.websiteUrl || "",
          iban: data.iban || "",
          bic: data.bic || "",
          bankName: data.bankName || "",
          legalNoticeInvoice: data.legalNoticeInvoice || "",
        },
      });
      return {
        id: created.id,
        legalName: created.legalName,
        tradeName: created.tradeName || "",
        siret: created.siret || "",
        vatNumber: created.vatNumber || "",
        apeCode: created.apeCode || "",
        address: created.address || "",
        postalCode: created.postalCode || "",
        city: created.city || "",
        country: created.country || "France",
        email: created.email || "",
        phone: created.phone || "",
        websiteUrl: created.websiteUrl || "",
        iban: created.iban || "",
        bic: created.bic || "",
        bankName: created.bankName || "",
        legalNoticeInvoice: created.legalNoticeInvoice || "",
        updatedAt: created.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour updateCompanySettings, mise à jour mock local :", err);
  }

  localSettingsStore = {
    ...localSettingsStore,
    ...data,
    updatedAt: new Date(),
  };
  return localSettingsStore;
}
