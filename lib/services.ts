import { db } from "@/lib/db";

export interface PublicServiceItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: string;
  isPublic: boolean;
  isActive: boolean;
  tag?: string;
  deliverables?: string[];
}

const DEFAULT_SERVICES: PublicServiceItem[] = [
  {
    id: "srv-podcasts",
    name: "Production & Réalisation de Podcasts Documentaires",
    description:
      "Conception narrative complète de séries audio, du travail d'enquête préalable à la prise de son terrain, sound design immersif et mixage broadcast.",
    unitPrice: 1850,
    unit: "épisode",
    isPublic: true,
    isActive: true,
    tag: "Format Audio Phare",
    deliverables: [
      "Bible éditoriale & trame scénaristique",
      "Interviews de témoins & experts en studio ou terrain",
      "Voix off, habillage sonore et mastering broadcast",
      "Accompagnement à la distribution & métadonnées",
    ],
  },
  {
    id: "srv-moderation",
    name: "Animation & Modération d'Événements",
    description:
      "Animation de tables rondes, conventions, débats citoyens et interviews en direct. Rigueur journalistique, rythme soutenu et valorisation des intervenants.",
    unitPrice: 1200,
    unit: "jour",
    isPublic: true,
    isActive: true,
    tag: "Scène & Direct",
    deliverables: [
      "Préparation en amont et cadrage des intervenants",
      "Écriture des conducteurs et transitions de plateau",
      "Animation bilingue Français / Anglais disponible",
      "Gestion fluide des interactions avec le public",
    ],
  },
  {
    id: "srv-enquetes",
    name: "Enquêtes & Grands Reportages d'Investigation",
    description:
      "Investigation de fond sur des sujets complexes : économie financière, souveraineté, transition écologique et coulisses du pouvoir. Fact-checking rigoureux.",
    unitPrice: 0, // Sur devis
    unit: "forfait",
    isPublic: true,
    isActive: true,
    tag: "Presse Écrite & Long Form",
    deliverables: [
      "Recherche documentaire et croisement des sources",
      "Reportage en immersion sur le terrain",
      "Rédaction d'articles longs formats prêts pour publication",
      "Dossiers multimédias avec infographies et captations",
    ],
  },
];

export async function getPublicServices(): Promise<PublicServiceItem[]> {
  try {
    const dbServices = await db.serviceCatalog.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (dbServices && dbServices.length > 0) {
      return dbServices.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        unitPrice: Number(s.unitPrice),
        unit: s.unit,
        isPublic: s.isPublic,
        isActive: s.isActive,
        tag: s.unit === "episode" ? "Format Audio Phare" : s.unit === "jour" ? "Scène & Direct" : "Prestation Spécialisée",
        deliverables: [
          "Cadrage éditorial & méthodologie d'enquête",
          "Production professionnelle aux normes presse",
          "Cession des droits de diffusion incluses",
          "Accompagnement et restitution clés en main",
        ],
      }));
    }
  } catch (err) {
    console.warn("Base de données non jointe pour services, utilisation des prestations locales :", err);
  }

  return DEFAULT_SERVICES;
}
