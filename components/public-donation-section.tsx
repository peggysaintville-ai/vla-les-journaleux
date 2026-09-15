import React from "react";
import { VitrineSettingsData } from "@/lib/vitrine-settings-types";
import {
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Compass,
} from "lucide-react";

interface PublicDonationSectionProps {
  settings: VitrineSettingsData;
}

export default function PublicDonationSection({ settings }: PublicDonationSectionProps) {
  // Règle stricte : si donationEnabled est désactivé, rien n'est rendu dans le DOM
  if (!settings.donationEnabled) {
    return null;
  }

  const title = settings.donationTitle || "Soutenir notre journalisme indépendant";
  const subtitle =
    settings.donationSubtitle ||
    "Aidez-nous à financer nos enquêtes et nos podcasts de terrain en toute liberté.";
  const description =
    settings.donationDescription && settings.donationDescription.trim().length > 0
      ? settings.donationDescription.trim()
      : `Chaque enquête approfondie nécessite des semaines de recherche documentaire, de déplacements sur le terrain et de vérification rigoureuse des sources.

En contribuant financièrement à notre studio, vous garantissez notre totale indépendance vis-à-vis des puissances économiques et politiques. Vos dons financent directement la production d'épisodes en accès libre et la protection de nos informateurs.`;
  const buttonText = settings.donationButtonText || "Faire un don libre";
  const donationUrl = settings.donationUrl || "https://donate.stripe.com/demo";
  const imageUrl =
    settings.donationImageUrl && settings.donationImageUrl.trim().length > 0
      ? settings.donationImageUrl.trim()
      : "/images/journalist-portrait.jpg";

  // Découpage du texte de description en paragraphes pour un rendu typographique aéré
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <section id="soutenir" className="scroll-mt-24 relative overflow-hidden py-6 sm:py-10">
      {/* Halo lumineux d'ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-rose-600/10 via-brand-accent/15 to-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900/95 via-neutral-900/80 to-neutral-950/95 border border-neutral-800 hover:border-brand-accent/30 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden transition-all duration-300">
          {/* Ligne décorative supérieure */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-brand-accent to-amber-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Colonne Gauche : Plaidoyer & Action */}
            <div className={imageUrl ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
              {/* Badges de transparence et de presse libre */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Presse Indépendante & Libre</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-300 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Financement 100% Citoyen</span>
                </div>
              </div>

              {/* Titre & Sous-titre */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  {title}
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              </div>

              {/* Paragraphes explicatifs stylisés */}
              <div className="space-y-3 text-xs sm:text-sm text-neutral-300/90 leading-relaxed">
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-neutral-200">
                    {para}
                  </p>
                ))}
              </div>

              {/* Piliers d'engagement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Enquêtes en accès libre</span>
                    <span className="text-[11px] text-neutral-400">Pour tout citoyen sans paywall</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-brand-accentLight shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Zéro influence externe</span>
                    <span className="text-[11px] text-neutral-400">Aucune consigne éditoriale</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Secret des sources</span>
                    <span className="text-[11px] text-neutral-400">Protection inviolable</span>
                  </div>
                </div>
              </div>

              {/* Bouton CTA et Réassurance */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href={donationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="vitrine-donation-cta"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-brand-accent to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-rose-500/20 hover:shadow-rose-500/35 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-white fill-current group-hover:scale-110 transition-transform" />
                  <span>{buttonText}</span>
                  <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Plateforme de paiement sécurisée & cryptée</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Image d'illustration si disponible */}
            {imageUrl && (
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />

                  {/* Badge en bas de photo */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        Financement 100% Indépendant
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-brand-cream/70">
                      V&apos;là les Journaleux
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
