import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWebsiteContent } from "@/lib/website-content";
import DashboardTeaserWidget from "@/components/dashboard-teaser-widget";
import { UserRole } from "@prisma/client";
import {
  Plus,
  Mic2,
  Video,
  Receipt,
  Calendar,
  Users,
  Tag,
  FileCheck2,
  BarChart3,
  Lock,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Headphones,
  ShieldAlert,
  FileText,
  PenTool,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isSuperAdmin =
    (user?.role as string) === "SUPER_ADMIN" ||
    (user?.role as any) === UserRole.SUPER_ADMIN ||
    user?.email?.toLowerCase().trim() === "madacreaapp@gmail.com";

  // 1. Récupération de la configuration SaaS pour conditionner l'activation des modules
  let config = {
    podcasts: true,
    interviews: true,
    facturation: true,
    planning: true,
    crm: true,
    contrats: true,
    analytics: true,
  };

  const metrics = {
    episodesMontageCount: 2,
    nextInterview: "Demain 14:00 • Dr. Sophie Bernard",
    quotesPendingCount: 1,
    quotesPendingAmount: "4 800 €",
    contactsCount: 3,
    episodesTotal: 2,
  };

  const websiteContent = await getWebsiteContent();

  try {
    const dbConfig = await db.saaSConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (dbConfig) {
      config = {
        podcasts: dbConfig.podcasts,
        interviews: dbConfig.interviews,
        facturation: dbConfig.facturation,
        planning: dbConfig.planning,
        crm: dbConfig.crm,
        contrats: dbConfig.contrats,
        analytics: dbConfig.analytics,
      };
    }

    // Récupération dynamique des compteurs réels en base si disponibles
    const [episodesCount, contactsCount] = await Promise.all([
      db.episode.count().catch(() => 2),
      db.contact.count().catch(() => 3),
    ]);
    metrics.episodesTotal = episodesCount;
    metrics.contactsCount = contactsCount;
  } catch (err) {
    console.warn("Utilisation des métriques locales de secours pour le dashboard :", err);
  }

  // 1b. Le SUPER_ADMIN bénéficie de tous les modules déverrouillés sans aucune restriction
  if (isSuperAdmin) {
    config = {
      podcasts: true,
      interviews: true,
      facturation: true,
      planning: true,
      crm: true,
      contrats: true,
      analytics: true,
    };
  }

  // 2. Définition des tuiles métiers conditionnées par les booléens de SaaSConfig
  const MODULE_TILES = [
    {
      id: "articles",
      title: "Rédaction & Blog Vitrine",
      description: "Rédaction d&apos;enquêtes, publication en 1 clic et diffusion sur la vitrine publique.",
      icon: FileText,
      metric: "3 articles rédigés",
      badge: "Publication Vitrine",
      enabled: true,
      href: "/articles",
      color: "from-brand-accent/25 to-brand-primary/30",
      accent: "text-brand-accentLight",
      border: "hover:border-brand-accent",
    },
    {
      id: "podcasts",
      title: "Podcasts & Émissions",
      description: "Pipeline éditorial : idée, écriture, enregistrement, montage et diffusion.",
      icon: Mic2,
      metric: `${metrics.episodesTotal} épisodes enregistrés`,
      badge: "Saison 1 & 2 en cours",
      enabled: config.podcasts,
      href: "/dashboard#podcasts",
      color: "from-brand-accent/20 to-brand-primary/20",
      accent: "text-brand-accentLight",
      border: "hover:border-brand-accent/50",
    },
    {
      id: "interviews",
      title: "Interviews & Studio",
      description: "Conducteur minuté, chronomètre studio en direct et retranscription audio.",
      icon: Video,
      metric: "Studio & Chrono direct",
      badge: "Chrono & Conducteur",
      enabled: config.interviews,
      href: "/interviews",
      color: "from-rose-500/20 to-rose-500/5",
      accent: "text-rose-400",
      border: "hover:border-rose-400/50",
    },
    {
      id: "commercial",
      title: "Commercial & Facturation",
      description: "Édition des devis, factures d&apos;émissions, suivi des règlements et acomptes.",
      icon: Receipt,
      metric: `${metrics.quotesPendingAmount} HT en attente`,
      badge: "1 devis à relancer",
      enabled: config.facturation,
      href: "/dashboard#commercial",
      color: "from-emerald-500/20 to-emerald-500/5",
      accent: "text-emerald-400",
      border: "hover:border-emerald-400/50",
    },
    {
      id: "planning",
      title: "Planning Média & Agenda",
      description: "Calendrier des prises de son, direct radio, mixages et livraisons diffuseurs.",
      icon: Calendar,
      metric: "3 rendez-vous cette semaine",
      badge: "Synchronisé",
      enabled: config.planning,
      href: "/dashboard#planning",
      color: "from-sky-500/20 to-sky-500/5",
      accent: "text-sky-400",
      border: "hover:border-sky-400/50",
    },
    {
      id: "crm",
      title: "CRM Contacts & Carnet",
      description: "Base d&apos;experts, attachés de presse, porte-paroles et clients B2B.",
      icon: Users,
      metric: `${metrics.contactsCount} contacts qualifiés`,
      badge: "Carnet d&apos;adresses actif",
      enabled: config.crm,
      href: "/dashboard#crm",
      color: "from-indigo-500/20 to-indigo-500/5",
      accent: "text-indigo-400",
      border: "hover:border-indigo-400/50",
    },
    {
      id: "catalogue",
      title: "Catalogue de Tarifs",
      description: "Grille de prix par format : animation, forfait documentaire ou journée studio.",
      icon: Tag,
      metric: "Tarification 2026 à jour",
      badge: "3 forfaits actifs",
      enabled: config.facturation, // Associé au module facturation
      href: "/dashboard#catalogue",
      color: "from-purple-500/20 to-purple-500/5",
      accent: "text-purple-400",
      border: "hover:border-purple-400/50",
    },
    {
      id: "contrats",
      title: "Contrats & Cessions Droits",
      description: "Droit à l&apos;image des témoins, accords de confidentialité et cessions d&apos;auteur.",
      icon: FileCheck2,
      metric: "100 % des sources couvertes",
      badge: "Juridique conforme",
      enabled: config.contrats,
      href: "/dashboard#contrats",
      color: "from-orange-500/20 to-orange-500/5",
      accent: "text-orange-400",
      border: "hover:border-orange-400/50",
    },
    {
      id: "analytics",
      title: "Pilotage CA & Audiences",
      description: "Statistiques d&apos;écoutes des plateformes, taux de complétion et revenu annuel.",
      icon: BarChart3,
      metric: "850k écoutes cumulées",
      badge: "+24% ce mois",
      enabled: config.analytics,
      href: "/dashboard#analytics",
      color: "from-teal-500/20 to-teal-500/5",
      accent: "text-teal-400",
      border: "hover:border-teal-400/50",
    },
  ];

  // 3. Vignette Console SaaS accessible pour le SUPER_ADMIN
  if (isSuperAdmin) {
    MODULE_TILES.push({
      id: "saas-console",
      title: "Console SaaS",
      description: "Supervision des licences, validité et interrupteurs de modules.",
      icon: ShieldAlert,
      metric: "Gestion Licence",
      badge: "Super Admin",
      enabled: true,
      href: "/saas",
      color: "from-indigo-500/20 to-indigo-500/5",
      accent: "text-indigo-400",
      border: "hover:border-indigo-400/50",
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. EN-TÊTE DU DASHBOARD & BOUTONS D'ACCÈS RAPIDE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/30 text-brand-accentLight text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio de Production Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bonjour {user?.name || "Louise"}, bienvenue en rédaction.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Voici la situation globale de vos productions audio et de vos engagements médias.
          </p>
        </div>

        {/* Boutons d'accès rapide */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Rédiger un Article</span>
          </Link>

          <Link
            href="/interviews"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary hover:bg-brand-secondary/80 text-brand-cream border border-brand-accent/30 hover:border-brand-accentLight font-semibold text-xs transition-all active:scale-95"
          >
            <Video className="w-4 h-4 text-brand-accent" />
            <span>Studio & Chronomètre</span>
          </Link>

          <Link
            href="/contrats/signature-rapide"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary hover:bg-brand-secondary/80 text-brand-cream border border-brand-accent/30 hover:border-brand-accentLight font-semibold text-xs transition-all active:scale-95"
          >
            <PenTool className="w-4 h-4 text-emerald-400" />
            <span>Signature Droit Image</span>
          </Link>
        </div>
      </div>

      {/* 2. CAMPAGNE TEASING & À LA UNE VITRINE (INTERRUPTEUR 1-CLIC) */}
      <DashboardTeaserWidget initialContent={websiteContent} />

      {/* 3. BANNIÈRE AVEC INDICATEURS CLÉS (KPIs MÉTIERS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 : Prochain enregistrement */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-accent/15 via-brand-secondary/30 to-neutral-900/90 border border-brand-accent/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accentLight flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Prochain enregistrement</span>
            </span>
            <span className="h-2 w-2 rounded-full bg-brand-accent animate-ping" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {metrics.nextInterview}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
            <Headphones className="w-3 h-3 text-neutral-400" />
            <span>Studio A • Prise de voix & questions contradictoires</span>
          </div>
        </div>

        {/* KPI 2 : Montages en cours */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-neutral-900/60 to-neutral-900/90 border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5" />
              <span>Montages en cours</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
              Étape 4/6
            </span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {metrics.episodesMontageCount} épisodes en post-production
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Épisode 2 : IA & Journalisme (Rough cut prêt pour validation)
          </div>
        </div>

        {/* KPI 3 : Devis à relancer */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-neutral-900/60 to-neutral-900/90 border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Devis à relancer</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              {metrics.quotesPendingAmount}
            </span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {metrics.quotesPendingCount} devis en attente de signature
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Nexus Media Group • Série documentaire 4 épisodes
          </div>
        </div>
      </div>

      {/* 3. GRILLE DE 8 TUILES INTERACTIVES DES MODULES MÉTIERS */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Modules Métiers de la Rédaction
          </h2>
          <span className="text-xs text-neutral-400">
            {isSuperAdmin
              ? "Tous les modules sont déverrouillés pour le Super Admin"
              : "Activation pilotée par votre licence SaaS"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULE_TILES.map((tile) => {
            const Icon = tile.icon;

            if (!tile.enabled) {
              // TUILE DÉSACTIVÉE (Grisée, non cliquable, badge désactivé)
              return (
                <div
                  key={tile.id}
                  className="rounded-2xl p-5 bg-neutral-900/30 border border-neutral-800/60 opacity-50 cursor-not-allowed select-none relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-500 text-[10px] font-mono">
                        <Lock className="w-3 h-3" />
                        <span>Module désactivé</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-400">
                      {tile.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2">
                      {tile.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-800/40 text-[11px] text-neutral-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Non inclus dans cette formule</span>
                  </div>
                </div>
              );
            }

            // TUILE ACTIVE (Interactive, colorée, hover et actions)
            return (
              <a
                key={tile.id}
                href={tile.href}
                className={`rounded-2xl p-5 bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 ${tile.border} transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-xl flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Subtle gradient background */}
                <div
                  className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${tile.color} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-300`}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center ${tile.accent} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-neutral-400 text-[10px] font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{tile.badge}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed line-clamp-2">
                    {tile.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">
                    {tile.metric}
                  </span>
                  <span className="p-1 rounded-lg bg-neutral-950 text-neutral-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
