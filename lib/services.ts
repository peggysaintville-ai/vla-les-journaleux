import { db } from "@/lib/db";

export interface PublicServiceItem {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  unitPrice: number;
  unit: string;
  isPublic: boolean;
  isActive: boolean;
  isPopular?: boolean;
  tag?: string;
  deliverables?: string[];
}

const DEFAULT_SERVICES: PublicServiceItem[] = [
  {
    id: "srv-podcasts",
    name: "Production & Réalisation de Podcasts Documentaires",
    description:
      "Conception narrative complète de séries audio, du travail d'enquête préalable à la prise de son terrain, sound design immersif et mixage broadcast.",
    subtitle:
      "Conception narrative complète de séries audio, du travail d'enquête préalable à la prise de son terrain, sound design immersif et mixage broadcast.",
    unitPrice: 1850,
    unit: "par épisode",
    isPublic: true,
    isActive: true,
    isPopular: true,
    tag: "Populaire",
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
    subtitle:
      "Animation de tables rondes, conventions, débats citoyens et interviews en direct. Rigueur journalistique, rythme soutenu et valorisation des intervenants.",
    unitPrice: 1200,
    unit: "par jour",
    isPublic: true,
    isActive: true,
    isPopular: false,
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
    subtitle:
      "Investigation de fond sur des sujets complexes : économie financière, souveraineté, transition écologique et coulisses du pouvoir. Fact-checking rigoureux.",
    unitPrice: 0, // Sur devis
    unit: "forfait",
    isPublic: true,
    isActive: true,
    isPopular: false,
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
    let dbServices = await db.serviceCatalog.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Auto-initialisation en base si la table est vide pour permettre la mise à jour immédiate
    if (!dbServices || dbServices.length === 0) {
      try {
        for (const def of DEFAULT_SERVICES) {
          await db.serviceCatalog.upsert({
            where: { id: def.id },
            update: {},
            create: {
              id: def.id,
              name: def.name,
              description: JSON.stringify({
                description: def.description,
                subtitle: def.subtitle || def.description,
                isPopular: def.isPopular ?? false,
                tag: def.isPopular ? "Populaire" : def.tag || "Prestation",
                deliverables: def.deliverables || [],
              }),
              unitPrice: def.unitPrice,
              unit: def.unit,
              isPublic: true,
              isActive: true,
            },
          });
        }
        dbServices = await db.serviceCatalog.findMany({
          where: { isPublic: true, isActive: true },
          orderBy: { createdAt: "asc" },
        });
      } catch (seedErr) {
        console.warn("Échec auto-seed serviceCatalog :", seedErr);
      }
    }

    if (dbServices && dbServices.length > 0) {
      return dbServices.map((s) => {
        let desc = s.description || "";
        let subtitle = "";
        let isPopular = false;
        let tag = s.unit === "episode" || s.unit === "par épisode" ? "Format Audio Phare" : s.unit === "jour" || s.unit === "par jour" ? "Scène & Direct" : "Prestation Spécialisée";
        let deliverables: string[] = [
          "Cadrage éditorial & méthodologie d'enquête",
          "Production professionnelle aux normes presse",
          "Cession des droits de diffusion incluses",
          "Accompagnement et restitution clés en main",
        ];

        const defMatch = DEFAULT_SERVICES.find((d) => d.id === s.id);
        if (defMatch?.deliverables) {
          deliverables = defMatch.deliverables;
        }

        if (desc.startsWith("{")) {
          try {
            const parsed = JSON.parse(desc);
            desc = parsed.description || parsed.subtitle || "";
            subtitle = parsed.subtitle || "";
            isPopular = !!parsed.isPopular;
            tag = parsed.tag || (isPopular ? "Populaire" : tag);
            if (Array.isArray(parsed.deliverables) && parsed.deliverables.length > 0) {
              deliverables = parsed.deliverables;
            }
          } catch {
            // plain text fallback
          }
        }

        return {
          id: s.id,
          name: s.name,
          description: desc || subtitle,
          subtitle: subtitle || desc,
          unitPrice: Number(s.unitPrice),
          unit: s.unit,
          isPublic: s.isPublic,
          isActive: s.isActive,
          isPopular,
          tag: isPopular ? "Populaire" : tag,
          deliverables,
        };
      });
    }
  } catch (err) {
    console.warn("Base de données non jointe pour services, utilisation des prestations locales :", err);
  }

  return DEFAULT_SERVICES;
}
