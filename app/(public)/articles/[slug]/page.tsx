import { getArticleBySlug, getArticles } from "@/lib/articles";
import { getVitrineSettings } from "@/lib/vitrine-settings";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles(false);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.isPublished) {
    return { title: "Article non trouvé | V'LÀ LES JOURNALEUX" };
  }
  return {
    title: `${article.title} | V'LÀ LES JOURNALEUX`,
    description: article.excerpt,
  };
}

export default async function PublicArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, vitrineSettings] = await Promise.all([
    getArticleBySlug(slug),
    getVitrineSettings(),
  ]);

  if (!article || !article.isPublished) {
    notFound();
  }

  // Calcul du temps de lecture estimé (environ 200 mots par minute)
  const wordCount = article.content.split(/\s+/).length;
  const readingTimeMin = Math.max(2, Math.ceil(wordCount / 200));

  return (
    <article className="min-h-screen pb-24 text-neutral-100">
      {/* 1. HERO ÉDITORIAL DE L'ARTICLE */}
      <header className="relative pt-12 sm:pt-20 pb-12 border-b border-neutral-800/80 overflow-hidden bg-neutral-950/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-brand-accent/15 via-brand-primary/20 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Fil d'Ariane */}
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-cream/70 hover:text-brand-accentLight transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Retour aux enquêtes & analyses</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-bold uppercase tracking-wider">
                Investigation Exclusive
              </span>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-neutral-600">•</span>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTimeMin} min de lecture</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-serif leading-relaxed border-l-2 border-brand-accent pl-4 italic">
              {article.excerpt}
            </p>
          </div>

          {/* Signature auteur */}
          <div className="pt-4 flex items-center justify-between border-t border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-brand-accent/50 shadow-md">
                <Image
                  src="/logo.png"
                  alt="V'LÀ LES JOURNALEUX"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Rédaction V&apos;LÀ LES JOURNALEUX • Carte de presse n° 128492
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                ✦ Vérifié & Documenté
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CORPS DE L'ARTICLE */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert prose-neutral max-w-none space-y-6 text-neutral-200 leading-relaxed font-sans text-base sm:text-lg">
          {article.content.split("\n\n").map((block, idx) => {
            if (block.startsWith("## ")) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-6 pb-2 border-b border-neutral-800"
                >
                  {block.replace("## ", "")}
                </h2>
              );
            }
            if (block.startsWith("### ")) {
              return (
                <h3
                  key={idx}
                  className="text-xl font-bold text-brand-accentLight tracking-tight pt-4 pb-1"
                >
                  {block.replace("### ", "")}
                </h3>
              );
            }
            if (block.startsWith("> ")) {
              return (
                <blockquote
                  key={idx}
                  className="p-5 rounded-2xl bg-neutral-900/80 border-l-4 border-brand-accent text-neutral-200 font-serif italic my-6 shadow-lg"
                >
                  {block.replace(/^>\s*/gm, "")}
                </blockquote>
              );
            }
            if (block.startsWith("- ")) {
              return (
                <ul key={idx} className="space-y-2 my-4 pl-4 list-disc marker:text-brand-accent">
                  {block.split("\n").map((line, lIdx) => (
                    <li key={lIdx} className="text-neutral-300 text-sm sm:text-base">
                      {line.replace("- ", "")}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-neutral-300 leading-relaxed text-sm sm:text-base">
                {block}
              </p>
            );
          })}
        </div>

        {/* Pied de l'article avec call to action */}
        <div className="mt-16 pt-8 border-t border-neutral-800 space-y-6">
          <div className="p-6 rounded-2xl bg-brand-primary/40 border border-brand-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">
                Vous souhaitez réagir ou proposer un témoignage d&apos;enquête ?
              </div>
              <p className="text-xs text-brand-cream/70 mt-1">
                La rédaction garantit l&apos;anonymat strict et la protection des sources.
              </p>
            </div>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-md transition shrink-0"
            >
              <span>Contacter la rédaction</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-400">
            <Link
              href="/#articles"
              className="hover:text-white inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Toutes nos publications</span>
            </Link>
            <span>© V&apos;LÀ LES JOURNALEUX • {vitrineSettings.heroJournalistName || "Peggy SAINT-VILLE"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
