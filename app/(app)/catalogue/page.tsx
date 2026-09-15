import { Metadata } from "next";
import { getPublicServices } from "@/lib/services";
import CatalogueManager from "@/components/catalogue-manager";

export const metadata: Metadata = {
  title: "Catalogue de Tarifs & Prestations | V'LÀ LES JOURNALEUX",
  description: "Barème des prestations journalistiques, tarifs d'animation et de réalisation sonore.",
};

export default async function CataloguePage() {
  const services = await getPublicServices();

  return <CatalogueManager initialServices={services} />;
}
