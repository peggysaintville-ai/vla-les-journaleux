import { Metadata } from "next";
import { getWebsiteContent } from "@/lib/website-content";
import { getVitrineSettings } from "@/lib/vitrine-settings";
import WebsiteContentForm from "@/components/website-content-form";
import { Globe, ExternalLink, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestion du Site Vitrine | V'LÀ LES JOURNALEUX",
  description: "Éditeur CMS modulaire pour personnaliser les sections, la musique d'ambiance et les médias de la vitrine.",
};

export default async function SiteVitrineAdminPage() {
  const [content, vitrineSettings] = await Promise.all([
    getWebsiteContent(),
    getVitrineSettings(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary border border-brand-accent/30 text-brand-accent flex items-center justify-center shadow-md shadow-brand-secondary/40">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Gestion du Site Vitrine
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personnalisez les textes de présentation, la biographie et les coordonnées de la vitrine publique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-secondary/70 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/30 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-accentLight" />
            <span>Voir le site en direct</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Formulaire CMS Modulaire No-Code */}
      <WebsiteContentForm
        initialContent={content}
        initialVitrineSettings={vitrineSettings}
      />
    </div>
  );
}
