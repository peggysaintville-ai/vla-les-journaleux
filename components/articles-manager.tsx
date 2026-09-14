"use client";

import { useState, useTransition, useActionState } from "react";
import { ArticleItem } from "@/lib/articles";
import { saveArticleAction, togglePublishAction, deleteArticleAction } from "@/app/(app)/articles/actions";
import {
  FileText,
  Plus,
  Globe,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Calendar,
  X,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface ArticlesManagerProps {
  initialArticles: ArticleItem[];
}

export default function ArticlesManager({ initialArticles }: ArticlesManagerProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const openNewArticle = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setIsPublished(false);
    setIsEditorOpen(true);
  };

  const openEditArticle = (art: ArticleItem) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setExcerpt(art.excerpt || "");
    setContent(art.content);
    setCoverImage(art.coverImage || "");
    setIsPublished(art.isPublished);
    setIsEditorOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const [formState, formAction, isSaving] = useActionState(async (prev: unknown, fd: FormData) => {
    fd.set("isPublished", isPublished ? "true" : "false");
    const res = await saveArticleAction(null, fd);
    if (res.success && res.article) {
      setIsEditorOpen(false);
      setToast({ type: "success", text: res.message || "Article enregistré." });
      setArticles((prevList) => {
        const exists = prevList.some((a) => a.id === res.article!.id);
        if (exists) {
          return prevList.map((a) => (a.id === res.article!.id ? res.article! : a));
        }
        return [res.article!, ...prevList];
      });
    } else if (res.error) {
      setToast({ type: "error", text: res.error });
    }
    return res;
  }, null);

  const handleTogglePublish = (art: ArticleItem) => {
    startTransition(async () => {
      const res = await togglePublishAction(art.id);
      if (res.success && res.isPublished !== undefined) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? { ...a, isPublished: res.isPublished! } : a))
        );
        setToast({ type: "success", text: res.message || "Statut mis à jour." });
      }
    });
  };

  const handleDelete = (art: ArticleItem) => {
    if (!confirm(`Supprimer définitivement l'article "${art.title}" ?`)) return;

    startTransition(async () => {
      const res = await deleteArticleAction(art.id);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== art.id));
        setToast({ type: "success", text: res.message || "Article supprimé." });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* En-tête de page & Action principale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rédaction & Blog Vitrine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Articles & Enquêtes Publiées
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Rédigez vos articles d&apos;investigation et publiez-les directement sur le site vitrine.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewArticle}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/25 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Rédiger un article</span>
        </button>
      </div>

      {/* Liste des articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((art) => (
          <div
            key={art.id}
            className="rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-brand-accent/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider ${
                    art.isPublished
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-neutral-800 border border-neutral-700 text-neutral-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      art.isPublished ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                    }`}
                  />
                  <span>{art.isPublished ? "En Ligne (Vitrine)" : "Brouillon"}</span>
                </span>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(art.publishedAt || art.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-brand-accentLight transition-colors line-clamp-2">
                {art.title}
              </h3>

              <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            {/* Pied de carte d'article */}
            <div className="pt-4 mt-4 border-t border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                {/* Toggle switch publier */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={art.isPublished}
                    onChange={() => handleTogglePublish(art)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative" />
                  <span className="text-[11px] text-neutral-400">
                    {art.isPublished ? "Publié" : "Masqué"}
                  </span>
                </label>

                {art.isPublished && (
                  <Link
                    href={`/articles/${art.slug}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-brand-accentLight hover:underline inline-flex items-center gap-1"
                  >
                    <span>Voir</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditArticle(art)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                  title="Modifier l'article"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(art)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition"
                  title="Supprimer l'article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Tiroir d'Édition d'Article */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingArticle ? "Modifier l'article" : "Rédiger une nouvelle enquête"}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Mise en page éditoriale prête pour le site vitrine.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-5">
              {editingArticle && <input type="hidden" name="id" value={editingArticle.id} />}
              <input type="hidden" name="coverImage" value={coverImage} />

              {formState?.error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formState.error}</span>
                </div>
              )}

              {/* Titre & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Titre de l&apos;enquête / reportage *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Ex. Scandale des cabinets de conseil : révélations..."
                    className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="scandale-cabinets-conseil"
                    className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 font-mono text-xs placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                  />
                </div>
              </div>

              {/* Extrait */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Chapeau / Extrait accrocheur *
                </label>
                <textarea
                  name="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  required
                  placeholder="Résumé percutant qui s'affiche sur les cartes de la vitrine et sous le titre..."
                  className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition resize-y"
                />
              </div>

              {/* Contenu Markdown / Texte */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Corps de l&apos;article (Markdown supporté) *
                  </label>
                  <span className="text-[11px] text-neutral-500">Titres ##, citations &gt;, listes -</span>
                </div>
                <textarea
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                  placeholder="Rédigez le déroulé de votre enquête, les citations de témoins, les chiffres clés..."
                  className="w-full px-4 py-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-neutral-100 font-sans placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition resize-y"
                />
              </div>

              {/* Toggle switch de publication */}
              <div className="p-4 rounded-2xl bg-brand-primary/40 border border-brand-accent/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-brand-accentLight" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Publier sur le site vitrine
                    </div>
                    <div className="text-[11px] text-brand-cream/70">
                      Rend l&apos;article immédiatement visible pour les internautes et diffuseurs.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent" />
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{isPublished ? "Sauvegarder & Publier" : "Enregistrer en Brouillon"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
