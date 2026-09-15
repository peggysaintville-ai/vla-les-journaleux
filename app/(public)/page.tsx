import Link from "next/link";
import AudioPlayer from "@/components/audio-player";
import ContactForm from "@/components/contact-form";
import PublicTeaserBanner from "@/components/public-teaser-banner";
import PublicDonationSection from "@/components/public-donation-section";
import MediaEmbed from "@/components/media-embed";
import { getArticles } from "@/lib/articles";
import { getPublicServices } from "@/lib/services";
import { getWebsiteContent } from "@/lib/website-content";
import { getVitrineSettings } from "@/lib/vitrine-settings";
import {
  Mic2,
  FileText,
  Radio,
  Award,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Calendar,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "V'LÀ LES JOURNALEUX | Studio d'Investigation & Enquêtes",
  description:
    "Production éditoriale d'investigation, podcasts documentaires, enquêtes exclusives et modération d'événements d'actualité.",
};

const PARTNER_MEDIAS = [
  { name: "Radio France", subtitle: "France Culture & Inter" },
  { name: "Arte Radio", subtitle: "Créations Sonores" },
  { name: "Le Monde", subtitle: "Enquêtes & Grands Formats" },
  { name: "Médiapart", subtitle: "Investigations" },
  { name: "RTBF", subtitle: "Documentaires Radio" },
];

export default async function PublicShowcasePage() {
  const [publishedArticles, publicServices, websiteContent, vitrineSettings] = await Promise.all([
    getArticles(false),
    getPublicServices(),
    getWebsiteContent(),
    getVitrineSettings(),
  ]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      {/* 1. HERO SECTION - EN-TÊTE ABSOLUE EN HAUT DE PAGE */}
      <section className="relative pt-2 sm:pt-4 lg:pt-6 overflow-hidden">
        {/* Halo lumineux d'ambiance */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[750px] h-[320px] bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-transparent blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Colonne Texte & Positionnement */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-amber-400 text-[11px] font-semibold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Journaliste d&apos;Investigation & Réalisatrice Sonore</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-[1.2] whitespace-pre-line">
                {vitrineSettings.heroTitle || websiteContent.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed whitespace-pre-line">
                {vitrineSettings.heroSubtitle || websiteContent.heroSubtitle}
              </p>

              {/* Boutons d'action Hero */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#articles"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 transition-all transform active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explorer les enquêtes</span>
                </a>

                <a
                  href="#ecoutes"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-brand-accentLight" />
                  <span>Écouter les extraits</span>
                </a>

                <a
                  href="#bio"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <span>Démarche & Bio</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-accentLight" />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/30 hover:border-brand-accentLight text-xs font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <span>Demander un devis</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-accentLight" />
                </a>
              </div>

              {/* Indicateurs clés */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    12+
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Années d&apos;enquête
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    850k+
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Écoutes cumulées
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    4
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Prix journalistiques
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Portrait Éditorial */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/50 shadow-xl group">
                <div className="aspect-[4/3] max-h-[260px] sm:max-h-[300px] relative w-full overflow-hidden bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vitrineSettings.heroPhotoUrl || "/images/journalist-portrait.jpg"}
                    alt={`${vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"} - Journaliste d'investigation`}
                    style={{ objectPosition: vitrineSettings.heroPhotoPosition || "center center" }}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                <div className="p-3.5 bg-neutral-900/90 border-t border-neutral-800/80 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {vitrineSettings.heroCaption || "En direct de la rédaction centrale"}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{vitrineSettings.heroBadgeStatus || "En production active"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARCOURS & BIO (#bio) - Immédiatement sous le Hero pour une lecture fluide */}
      {vitrineSettings.showBioSection && (
        <section id="bio" className="scroll-mt-20 py-2 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Bio & Démarche Éditoriale</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {vitrineSettings.bioTitle || "L'indépendance comme boussole, l'humain comme centre."}
                  </h2>
                  <div className="space-y-3.5 text-sm text-neutral-300 leading-relaxed">
                    {(vitrineSettings.heroBio || vitrineSettings.bioText || websiteContent.bioText).split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Chartes & Déontologie
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Respect absolu de la charte de Munich. Protection stricte du
                      secret des sources et vérification contradictoire systématique.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-400/10 text-indigo-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Production Intégrée
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      De la recherche documentaire initiale au mixage stéréo &
                      binaural final, maîtrise de l&apos;ensemble de la chaîne de valeur.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-400/10 text-rose-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Distinctions Récentes
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Prix de l&apos;Enquête Audio 2024 pour la série sur la souveraineté
                      des données. Sélection officielle Festival Longueur d&apos;Ondes.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Réactivité Rédactionnelle
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Capacité de déploiement d&apos;urgence pour des sujets d&apos;actualité
                      brûlante ou des prises de parole institutionnelles d&apos;envergure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Badges Médias Partenaires */}
      <section className="py-2 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-4 border-t border-neutral-800/80">
            <p className="text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-4">
              Enquêtes & reportages diffusés sur les grandes antennes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
              {PARTNER_MEDIAS.map((media) => (
                <div
                  key={media.name}
                  className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700 text-center transition-all group"
                >
                  <div className="text-xs sm:text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">
                    {media.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {media.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. ENQUÊTES & ARTICLES DU BLOG (#articles & #enquetes) */}
      {vitrineSettings.showArticlesSection && (
        <section id="articles" className="scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Enquêtes & Révélations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Le Carnet d&apos;Investigation
              </h2>
              <p className="text-sm text-neutral-400">
                Analyses de fond, décryptages documentés et coulisses de nos reportages d&apos;actualité.
              </p>
            </div>

            {publishedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedArticles.map((art) => (
                  <article
                    key={art.id}
                    className="rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-brand-accent/50 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-brand-primary text-brand-accentLight text-[11px] font-mono font-bold uppercase tracking-wider border border-brand-accent/30">
                          {art.category || "Investigation"}
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(art.publishedAt || art.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-brand-accentLight transition-colors line-clamp-2">
                        <Link href={`/articles/${art.slug}`}>
                          {art.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-brand-accent" />
                        <span>{Math.max(2, Math.ceil(art.content.split(/\s+/).length / 200))} min de lecture</span>
                      </div>

                      <Link
                        href={`/articles/${art.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accentLight hover:text-white transition group-hover:translate-x-1"
                      >
                        <span>Lire l&apos;enquête</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 text-neutral-400 text-sm">
                Aucune enquête n&apos;est actuellement publiée en libre accès.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. CATALOGUE DE PRESTATIONS & TARIFS (#prestations & #tarifs) */}
      <section id="prestations" className="scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expertise & Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Catalogue de Prestations
            </h2>
            <p className="text-sm text-neutral-400">
              Prestations éditoriales et studio disponibles pour rédactions, institutions culturelles et entreprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publicServices.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-brand-accent/50 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl group"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/80 border border-brand-accent/30 flex items-center justify-center text-brand-accentLight group-hover:scale-110 transition-transform">
                      {service.unit === "episode" ? (
                        <Mic2 className="w-6 h-6" />
                      ) : service.unit === "jour" ? (
                        <Radio className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400">
                      {service.tag || "Prestation"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-accentLight transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Affichage du tarif ou mention Sur devis */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-baseline gap-2">
                      {service.unitPrice > 0 ? (
                        <>
                          <span className="text-2xl font-extrabold text-white font-mono">
                            {service.unitPrice.toLocaleString("fr-FR")} €
                          </span>
                          <span className="text-xs text-brand-cream/70 font-mono">
                            HT / {service.unit}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-extrabold text-brand-accentLight font-mono uppercase tracking-wider">
                          ✦ Sur devis sur-mesure
                        </span>
                      )}
                    </div>
                  </div>

                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
                      <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Engagements inclus :
                      </div>
                      <ul className="space-y-2">
                        {service.deliverables.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-neutral-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-accentLight shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-800/80">
                  <a
                    href="#contact"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-accent text-brand-cream hover:text-white border border-brand-accent/30 hover:border-brand-accent text-xs font-bold transition-all duration-200 shadow-sm"
                  >
                    <span>Demander un devis pour ce format</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PLAYER AUDIO INTERACTIF & PODCASTS (#ecoutes) */}
      {vitrineSettings.showPodcastsSection && (
        <section id="ecoutes" className="scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Bannière Teaser Projet si activée */}
            {vitrineSettings.showTeaserBanner && (
              <PublicTeaserBanner
                teaser={{
                  teaserEnabled: true,
                  teaserTitle: vitrineSettings.teaserTitle || websiteContent.teaserTitle,
                  teaserHook: vitrineSettings.teaserSubtitle || websiteContent.teaserHook,
                  teaserAudioUrl: vitrineSettings.teaserAudioUrl || null,
                  teaserLinkUrl: vitrineSettings.teaserExternalLink || websiteContent.teaserLinkUrl,
                  teaserBadge: "Bientôt disponible",
                  teaserReleaseDate: websiteContent.teaserReleaseDate,
                }}
              />
            )}

            <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold uppercase tracking-wider">
                <Headphones className="w-3.5 h-3.5" />
                <span>Studio d&apos;Écoute</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Extraits & Créations Sonores
              </h2>
              <p className="text-sm text-neutral-400">
                Découvrez la signature sonore de mes documentaires : immersion sur le
                terrain, entretiens sensibles et réalisation soignée.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <AudioPlayer />

              {/* Lecteurs Multimédias Externes Synchronisés */}
              {(vitrineSettings.videoUrl || vitrineSettings.audioEmbedUrl || websiteContent.videoUrl || websiteContent.audioEmbedUrl) && (
                <div className="space-y-6 pt-10 border-t border-neutral-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-accentLight" />
                        <span>Immersion Multimédia & Grands Formats</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Lecteurs externes synchronisés : la musique d&apos;ambiance du site se coupe automatiquement dès le démarrage de la vidéo ou du son.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {(vitrineSettings.videoUrl || websiteContent.videoUrl) && (
                      <MediaEmbed
                        url={(vitrineSettings.videoUrl || websiteContent.videoUrl)!}
                        title="Grand Format Documentaire (YouTube / Vidéo)"
                      />
                    )}
                    {(vitrineSettings.audioEmbedUrl || websiteContent.audioEmbedUrl) && (
                      <MediaEmbed
                        url={(vitrineSettings.audioEmbedUrl || websiteContent.audioEmbedUrl)!}
                        title="Écoute Intégrale Plateforme (Spotify / Apple Podcasts)"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION SOUTIEN & DONS (FINANCEMENT PARTICIPATIF) */}
      <PublicDonationSection settings={vitrineSettings} />

      {/* 7. FORMULAIRE DE CONTACT & RÉSERVATION (#contact) */}
      {vitrineSettings.showContactSection && (
        <section id="contact" className="scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prise de Contact & Collaborations</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Engageons votre prochain projet éditorial.
                </h2>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  Vous préparez une série de podcasts, organisez un festival média,
                  ou recherchez une plume d&apos;investigation ? Remplissez ce
                  formulaire pour échanger sur vos objectifs et recevoir un devis
                  détaillé.
                </p>

                <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Modalités & Engagements
                  </div>
                  <div className="space-y-3 text-xs text-neutral-400">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Premier cadrage téléphonique offert de 30 minutes</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Devis clair et engagement sur les livrables</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cession des droits d&apos;auteur encadrée par contrat</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="text-xs text-neutral-400">
                      <span className="block text-[10px] uppercase font-mono text-brand-accentLight">Email direct</span>
                      <a href={`mailto:${websiteContent.contactEmail}`} className="font-semibold text-white hover:text-brand-accent transition">
                        {websiteContent.contactEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
