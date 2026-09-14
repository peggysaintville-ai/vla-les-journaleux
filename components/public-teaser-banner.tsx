"use client";

import { Sparkles, ExternalLink, Calendar, Radio } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface PublicTeaserBannerProps {
  teaser: {
    teaserEnabled: boolean;
    teaserBadge?: string | null;
    teaserTitle?: string | null;
    teaserHook?: string | null;
    teaserLinkUrl?: string | null;
    teaserLinkLabel?: string | null;
    teaserReleaseDate?: Date | string | null;
  };
}

export default function PublicTeaserBanner({ teaser }: PublicTeaserBannerProps) {
  if (!teaser?.teaserEnabled || !teaser?.teaserTitle) {
    return null;
  }

  const badgeText = teaser.teaserBadge || "Bientôt disponible";
  const linkUrl = teaser.teaserLinkUrl || "https://instagram.com/vlalesjournaleux";
  const linkLabel = teaser.teaserLinkLabel || "Voir l'annonce officielle";

  return (
    <aside aria-label="Annonce du projet à venir" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-secondary via-brand-primary to-neutral-900 border border-brand-accent/40 shadow-2xl p-6 sm:p-8 text-white my-6">
      {/* Ambient background glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-accent/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Badge vibrant & indicateur */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/50 text-brand-accentLight text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
              <span>{badgeText}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-brand-cream/80 text-[11px] font-mono font-medium">
              <Radio className="w-3 h-3 text-brand-accentLight" />
              <span>Prochainement au studio</span>
            </div>

            {teaser.teaserReleaseDate && (
              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-300 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Sortie :{" "}
                  <strong className="text-white">
                    {new Date(teaser.teaserReleaseDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Titre & Accroche */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {teaser.teaserTitle}
            </h2>
            {teaser.teaserHook && (
              <p className="text-sm sm:text-base text-brand-cream/85 mt-1.5 leading-relaxed">
                {teaser.teaserHook}
              </p>
            )}
          </div>
        </div>

        {/* Bouton d'action externe Instagram */}
        <div className="shrink-0 w-full lg:w-auto">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            <InstagramIcon className="w-4 h-4 text-white shrink-0" />
            <span>{linkLabel}</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80" />
          </a>
        </div>
      </div>
    </aside>
  );
}
