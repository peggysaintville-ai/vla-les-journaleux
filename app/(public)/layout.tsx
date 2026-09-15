import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowUpRight } from "lucide-react";
import BackgroundAudio from "@/components/background-audio";
import { getVitrineSettings } from "@/lib/vitrine-settings";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const vitrineSettings = await getVitrineSettings();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-brand-accent selection:text-white">
      {/* Header Sticky avec flou verre */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Signature V'LÀ LES JOURNALEUX */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden ring-2 ring-brand-accent/50 shadow-md shadow-brand-primary/40 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="V'LÀ LES JOURNALEUX"
                fill
                sizes="44px"
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-brand-accentLight transition-colors">
                V&apos;LÀ LES JOURNALEUX
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-brand-cream/70">
                {vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"} • Studio d&apos;Investigation
              </span>
            </div>
          </Link>

          {/* Navigation fluide par ancres conditionnée par la visibilité des sections */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
            {vitrineSettings.showBioSection && (
              <a
                href="#bio"
                className="hover:text-brand-accentLight transition-colors duration-200 tracking-wide"
              >
                Parcours & Bio
              </a>
            )}
            {vitrineSettings.showArticlesSection && (
              <a
                href="#articles"
                className="hover:text-brand-accentLight transition-colors duration-200 tracking-wide"
              >
                Enquêtes
              </a>
            )}
            <a
              href="#prestations"
              className="hover:text-brand-accentLight transition-colors duration-200 tracking-wide"
            >
              Prestations & Tarifs
            </a>
            {vitrineSettings.showPodcastsSection && (
              <a
                href="#ecoutes"
                className="hover:text-brand-accentLight transition-colors duration-200 tracking-wide"
              >
                Écoutes & Podcasts
              </a>
            )}
            {vitrineSettings.donationEnabled && (
              <a
                href="#soutenir"
                className="text-rose-400 hover:text-rose-300 transition-colors duration-200 tracking-wide font-semibold"
              >
                Soutenir
              </a>
            )}
            {vitrineSettings.showContactSection && (
              <a
                href="#contact"
                className="hover:text-brand-accentLight transition-colors duration-200 tracking-wide"
              >
                Contact
              </a>
            )}
          </nav>

          {/* Actions : Login */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/30 text-xs font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5 text-brand-accentLight" />
              <span>Espace Rédaction</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu de la vitrine */}
      <main className="flex-1">{children}</main>

      {/* Lecteur de fond sonore permanent discret (géré par cookie/localStorage) */}
      <BackgroundAudio
        enabled={vitrineSettings.showAudioBackground}
        audioUrl={vitrineSettings.audioBackgroundUrl}
        title={vitrineSettings.audioBackgroundTitle}
        defaultVolume={0.25}
      />

      {/* Footer minimaliste et premium */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-12 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Disponible pour missions éditoriales, modérations et tournages</span>
            </div>
            <p className="text-neutral-500">
              © {new Date().getFullYear()} V&apos;LÀ LES JOURNALEUX • {vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"}. Tous droits réservés. Carte de presse n° 128492.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#contact"
              className="hover:text-brand-cream transition-colors flex items-center gap-1"
            >
              <span>Demande d&apos;interview</span>
              <ArrowUpRight className="w-3 h-3 text-neutral-500" />
            </a>
            <a
              href="#prestations"
              className="hover:text-brand-cream transition-colors flex items-center gap-1"
            >
              <span>Grille tarifaire</span>
              <ArrowUpRight className="w-3 h-3 text-neutral-500" />
            </a>
            <Link
              href="/login"
              className="hover:text-brand-accentLight transition-colors font-medium flex items-center gap-1"
            >
              <span>Espace Rédaction</span>
              <Lock className="w-3 h-3 text-brand-accentLight" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
