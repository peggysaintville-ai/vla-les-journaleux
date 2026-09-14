import { db } from "@/lib/db";

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage?: string | null;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Données de secours locales pour le développement ou mode hors ligne
let localArticlesStore: ArticleItem[] = [
  {
    id: "art-1",
    title: "Dans les coulisses des cabinets de conseil : 18 mois d'investigation financière",
    slug: "coulisses-cabinets-conseil-investigation-financiere",
    excerpt: "Comment les multinationales du conseil ont privatisé des pans entiers de la décision publique. Documents inédits et témoignages exclusifs sous anonymat.",
    content: `## L'engrenage feutré de la sous-traitance d'État

Pendant près d'un an et demi, notre rédaction a compulsé plus de 4 000 pages de bons de commande, de correspondances ministérielles et de livrables confidentiels. Ce que révèlent ces documents dépasse la simple assistance technique : il s'agit d'une délégation méthodique de missions régaliennes à des entités privées lucratives.

> "Nous ne faisions plus que valider des diapositives Powerpoint rédigées la veille par des consultants de 26 ans payés 2 800 euros la journée."  
> — *Haut fonctionnaire en poste à Bercy (témoignage recueilli sous X)*

### Des facturations déconnectées du travail réel
Nos investigations ont permis d'identifier une tarification systématique en forfait journalier moyen oscillant entre 1 800 € et 3 200 € hors taxes par consultant. Sur des dossiers stratégiques touchant à la santé publique et à la transition énergétique, les préconisations fournies reprenaient quasi mot pour mot des études déjà publiées en libre accès.

### Le coût démocratique de l'opacité
Au-delà des montants financiers colossaux engagés sur les deniers publics, c'est l'indépendance de l'expertise publique qui se trouve durablement érodée. Retrouvez notre série documentaire complète en 4 épisodes audio disponible sur notre studio.`,
    coverImage: "/images/investigation-conseil.jpg",
    isPublished: true,
    publishedAt: new Date("2026-03-01T10:00:00Z"),
    createdAt: new Date("2026-02-28T09:00:00Z"),
    updatedAt: new Date("2026-03-01T10:00:00Z"),
  },
  {
    id: "art-2",
    title: "Cyberguerre et fermes à trolls : autopsie d'une campagne de déstabilisation électorale",
    slug: "cyberguerre-fermes-a-trolls-destabilisation-electorale",
    excerpt: "Infiltration d'un réseau international de désinformation coordonnée utilisant des modèles de langage automatisés pour saturer l'espace médiatique francophone.",
    content: `## 48 heures au cœur de la machine à viralité

À l'aide d'outils d'analyse sémantique et de comptes sondes, nous avons remonté la trace d'un réseau coordonné de plus de 12 000 profils automatisés sur les réseaux sociaux. Leur objectif : injecter de faux scandales et polariser le débat à chaque échéance électorale majeure.

### Des technologies d'automatisation massives
Les opérateurs de ces plateformes ne se contentent plus de simples messages préenregistrés. Ils exploitent désormais des micro-modèles génératifs capables d'adapter leur vocabulaire et leurs arguments en temps réel face aux contradicteurs humains.

### Notre méthodologie d'enquête
Cette enquête a nécessité :
- La capture de 350 000 interactions numériques.
- L'analyse médico-légale des métadonnées de diffusion.
- Le croisement des adresses IP et serveurs mandataires répartis sur trois continents.`,
    coverImage: "/images/cyberguerre.jpg",
    isPublished: true,
    publishedAt: new Date("2026-03-05T14:30:00Z"),
    createdAt: new Date("2026-03-04T11:00:00Z"),
    updatedAt: new Date("2026-03-05T14:30:00Z"),
  },
  {
    id: "art-3",
    title: "Transition écologique ou mirage vert ? Le grand dossier sur les quotas carbone",
    slug: "transition-ecologique-mirage-vert-quotas-carbone",
    excerpt: "Brouillon en cours d'écriture : analyse des crédits carbone forestiers vendus à des compagnies aériennes internationales.",
    content: `## Enquête de terrain en Amérique du Sud et en Afrique centrale

Dossier en cours de rédaction par la rédaction de V'LÀ LES JOURNALEUX. Validation juridique des pièces en cours.`,
    coverImage: null,
    isPublished: false,
    publishedAt: null,
    createdAt: new Date("2026-03-10T16:00:00Z"),
    updatedAt: new Date("2026-03-10T16:00:00Z"),
  },
];

export async function getArticles(includeUnpublished = false): Promise<ArticleItem[]> {
  try {
    const articles = await db.article.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (articles && articles.length > 0) {
      return articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt || "",
        content: a.content,
        coverImage: a.coverImage,
        isPublished: a.isPublished,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
    }
  } catch (err) {
    console.warn("Base de données non jointe pour articles, utilisation du mock local :", err);
  }

  return localArticlesStore
    .filter((a) => (includeUnpublished ? true : a.isPublished))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  try {
    const article = await db.article.findUnique({
      where: { slug },
    });
    if (article) {
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        coverImage: article.coverImage,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
    }
  } catch (err) {
    console.warn("Base de données non jointe pour article by slug, recherche mock local :", err);
  }

  const found = localArticlesStore.find((a) => a.slug === slug);
  return found || null;
}

export async function saveArticle(data: {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
}): Promise<ArticleItem> {
  const publishedAt = data.isPublished ? new Date() : null;

  try {
    if (data.id) {
      const updated = await db.article.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? publishedAt || new Date() : null,
        },
      });
      return updated;
    } else {
      const created = await db.article.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          isPublished: data.isPublished,
          publishedAt,
        },
      });
      return created;
    }
  } catch (err) {
    console.warn("Base non jointe pour saveArticle, mise à jour du mock local :", err);
  }

  if (data.id) {
    const idx = localArticlesStore.findIndex((a) => a.id === data.id);
    if (idx !== -1) {
      localArticlesStore[idx] = {
        ...localArticlesStore[idx],
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? localArticlesStore[idx].publishedAt || new Date() : null,
        updatedAt: new Date(),
      };
      return localArticlesStore[idx];
    }
  }

  const newArticle: ArticleItem = {
    id: `art-${Date.now()}`,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage || null,
    isPublished: data.isPublished,
    publishedAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  localArticlesStore.unshift(newArticle);
  return newArticle;
}

export async function togglePublishArticle(id: string): Promise<boolean> {
  try {
    const existing = await db.article.findUnique({ where: { id } });
    if (existing) {
      const nextState = !existing.isPublished;
      await db.article.update({
        where: { id },
        data: {
          isPublished: nextState,
          publishedAt: nextState ? new Date() : null,
        },
      });
      return nextState;
    }
  } catch (err) {
    console.warn("Base non jointe pour togglePublishArticle :", err);
  }

  const localItem = localArticlesStore.find((a) => a.id === id);
  if (localItem) {
    localItem.isPublished = !localItem.isPublished;
    localItem.publishedAt = localItem.isPublished ? new Date() : null;
    localItem.updatedAt = new Date();
    return localItem.isPublished;
  }
  return false;
}

export async function deleteArticle(id: string): Promise<boolean> {
  try {
    await db.article.delete({ where: { id } });
    return true;
  } catch (err) {
    console.warn("Base non jointe pour deleteArticle :", err);
  }

  localArticlesStore = localArticlesStore.filter((a) => a.id !== id);
  return true;
}
