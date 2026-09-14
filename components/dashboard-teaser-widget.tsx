"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Radio, ExternalLink, Sparkles, Settings2, Calendar, Check, AlertCircle } from "lucide-react";
import { toggleTeaserAction } from "@/app/(app)/podcasts/actions-preprod";

interface DashboardTeaserWidgetProps {
  initialContent: {
    teaserEnabled: boolean;
    teaserBadge?: string | null;
    teaserTitle?: string | null;
    teaserHook?: string | null;
    teaserLinkUrl?: string | null;
    teaserLinkLabel?: string | null;
    teaserReleaseDate?: Date | string | null;
  };
}

export default function DashboardTeaserWidget({ initialContent }: DashboardTeaserWidgetProps) {
  const [isEnabled, setIsEnabled] = useState(initialContent.teaserEnabled);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    startTransition(async () => {
      const res = await toggleTeaserAction(checked);
      if (res.success) {
        setFeedback(checked ? "Teaser activé sur la vitrine !" : "Teaser masqué.");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setIsEnabled(!checked);
        setFeedback("Erreur lors de l'activation.");
        setTimeout(() => setFeedback(null), 3500);
      }
    });
  };

  const hasTitle = Boolean(initialContent.teaserTitle);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-secondary/90 via-brand-primary/80 to-neutral-900 border border-brand-accent/30 p-5 sm:p-6 shadow-xl text-white">
      {/* Glow décoratif */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-accent/15 blur-2xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-brand-accentLight text-[11px] font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-brand-accent" />
              <span>Campagne Teasing & À la une</span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-emerald-400 animate-ping" : "bg-neutral-500"}`} />
              {isEnabled ? "En ligne sur la Vitrine" : "Teaser Inactif"}
            </span>

            {feedback && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 animate-fade-in font-medium">
                <Check className="w-3.5 h-3.5" />
                {feedback}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{initialContent.teaserTitle || "Aucun projet en teasing configuré"}</span>
            {initialContent.teaserBadge && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-neutral-300 font-normal">
                {initialContent.teaserBadge}
              </span>
            )}
          </h3>

          <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
            {initialContent.teaserHook ||
              "Utilisez le bouton 'Préparer une production depuis un brief' dans vos podcasts ou configurez le teaser dans la gestion du site vitrine."}
          </p>

          {initialContent.teaserReleaseDate && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono pt-1">
              <Calendar className="w-3.5 h-3.5 text-brand-accent" />
              <span>
                Lancement prévu :{" "}
                <strong className="text-neutral-200">
                  {new Date(initialContent.teaserReleaseDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Bloc Interrupteur 1-clic & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-neutral-300 hidden sm:inline">
              Afficher sur la vitrine :
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                disabled={isPending || (!hasTitle && !isEnabled)}
                onChange={(e) => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent transition-colors disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/site-vitrine"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-neutral-200 hover:text-white transition"
            >
              <Settings2 className="w-3.5 h-3.5 text-brand-accent" />
              <span>Paramètres</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/70 hover:bg-brand-primary border border-brand-accent/30 text-[11px] font-semibold text-brand-accentLight hover:text-white transition"
            >
              <span>Voir en direct</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
