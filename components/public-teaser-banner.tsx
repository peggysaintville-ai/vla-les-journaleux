"use client";

import { ExternalLink, Calendar, Radio } from "lucide-react";

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
    teaserAudioUrl?: string | null;
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
    <aside aria-label="Annonce du projet à venir" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-secondary via-brand-primary to-neutral-900 border border-brand-accent/40 shadow-xl p-3.5 sm:p-4 text-white my-1 sm:my-2">
      {/* Ambient background glows */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-accent/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {/* Badge vibrant & indicateur */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-accent/20 border border-brand-accent/50 text-brand-accentLight text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
              <span>{badgeText}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-brand-cream/80 text-[10px] font-mono font-medium">
              <Radio className="w-3 h-3 text-brand-accentLight" />
              <span>Prochainement au studio</span>
            </div>

            {teaser.teaserReleaseDate && (
              <div className="inline-flex items-center gap-1 text-[11px] text-neutral-300 font-mono">
                <Calendar className="w-3 h-3 text-amber-400" />
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
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
              {teaser.teaserTitle}
            </h2>
            {teaser.teaserHook && (
              <p className="text-xs sm:text-sm text-brand-cream/85 line-clamp-1 leading-normal mt-0.5">
                {teaser.teaserHook}
              </p>
            )}

            {teaser.teaserAudioUrl && (
              <div className="pt-1.5">
                <audio
                  controls
                  src={teaser.teaserAudioUrl}
                  className="w-full max-w-sm h-7 accent-brand-accent rounded"
                  preload="none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bouton d'action externe Instagram */}
        <div className="shrink-0 w-full md:w-auto">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{linkLabel}</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </a>
        </div>
      </div>
    </aside>
  );
}
