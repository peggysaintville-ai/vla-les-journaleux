"use client";

import { useState, useTransition, useActionState, useRef } from "react";
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
  LayoutGrid,
  Table as TableIcon,
  Tag,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface ArticlesManagerProps {
  initialArticles: ArticleItem[];
}

export default function ArticlesManager({ initialArticles }: ArticlesManagerProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Investigation");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const openNewArticle = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setCategory("Investigation");
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
    setCategory(art.category || "Investigation");
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

  // Traitement d'upload d'image de couverture
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCoverImage(dataUrl);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => setIsProcessingImage(false);
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [formState, formAction, isSaving] = useActionState(async (prev: unknown, fd: FormData) => {
    fd.set("isPublished", isPublished ? "true" : "false");
    fd.set("category", category);
    fd.set("coverImage", coverImage);

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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg transition-all border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
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
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* En-tête de page & Action principale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary border border-brand-accent/40 text-brand-accentLight text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rédaction & Enquêtes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Catalogue des Articles & Enquêtes</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-accent/20 text-brand-accentLight border border-brand-accent/30">
              {articles.length} article{articles.length > 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Gérez vos enquêtes d&apos;investigation, modifiez les contenus, catégories et publiez sur la vitrine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher Vue Tableau / Grille */}
          <div className="inline-flex rounded-xl bg-neutral-900 border border-neutral-800 p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "table"
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "grid"
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openNewArticle}
            id="rediger-article-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white font-bold text-xs shadow-lg shadow-brand-accent/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Rédiger un article</span>
          </button>
        </div>
      </div>

      {/* VUE 1 : TABLEAU / CATALOGUE DES ARTICLES */}
      {viewMode === "table" ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Enquête & Titre</th>
                  <th className="py-4 px-4">Catégorie</th>
                  <th className="py-4 px-4">Statut</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {articles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-neutral-800/30 transition-colors group"
                  >
                    {/* Colonne Titre & Extrait */}
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3.5">
                        {/* Miniature */}
                        <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center text-neutral-600">
                          {art.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={art.coverImage}
                              alt={art.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-neutral-500" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-brand-accentLight transition-colors line-clamp-1">
                            {art.title}
                          </h3>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 font-sans">
                            {art.excerpt}
                          </p>
                          <div className="text-[10px] font-mono text-neutral-500">
                            /{art.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/80 border border-brand-accent/30 text-brand-accentLight text-[10px] font-mono font-bold uppercase tracking-wider">
                        <Tag className="w-3 h-3" />
                        <span>{art.category || "Investigation"}</span>
                      </span>
                    </td>

                    {/* Statut & Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={art.isPublished}
                            onChange={() => handleTogglePublish(art)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative" />
                        </label>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                            art.isPublished
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              art.isPublished ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                            }`}
                          />
                          <span>{art.isPublished ? "Publié" : "Brouillon"}</span>
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions sur chaque ligne */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Bouton d'action Modifier (icône crayon) */}
                        <button
                          type="button"
                          onClick={() => openEditArticle(art)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-brand-accent text-neutral-200 hover:text-white border border-neutral-700 hover:border-brand-accent text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                          title="Modifier l'article"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-accentLight group-hover:text-white" />
                          <span>Modifier</span>
                        </button>

                        {/* Lien voir sur site */}
                        {art.isPublished && (
                          <Link
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                            title="Voir sur le site vitrine"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Bouton supprimer */}
                        <button
                          type="button"
                          onClick={() => handleDelete(art)}
                          className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VUE 2 : GRILLE DE CARTES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-brand-accent/40 p-6 flex flex-col justify-between transition-all duration-200 shadow-xl group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/80 border border-brand-accent/30 text-brand-accentLight text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    <span>{art.category || "Investigation"}</span>
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
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

              {/* Pied de carte */}
              <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={art.isPublished}
                      onChange={() => handleTogglePublish(art)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative" />
                    <span className="text-[11px] text-neutral-400">
                      {art.isPublished ? "En Ligne" : "Brouillon"}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-brand-accent text-neutral-200 hover:text-white border border-neutral-700 hover:border-brand-accent text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                    title="Modifier l'article"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(art)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                    title="Supprimer l'article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Tiroir d'Édition d'Article */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-primary border border-brand-accent/40 text-brand-accentLight shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingArticle ? "Modifier l'article" : "Rédiger une nouvelle enquête"}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Modifiez le titre, le contenu, la catégorie, l&apos;image et le statut.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
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

              {/* Titre & Catégorie */}
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
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition font-semibold"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-accentLight" />
                    <span>Catégorie *</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    list="categories-list"
                    placeholder="Ex. Investigation, Société..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                  />
                  <datalist id="categories-list">
                    <option value="Investigation" />
                    <option value="Société & Pouvoir" />
                    <option value="Économie & Finance" />
                    <option value="Environnement & Climat" />
                    <option value="Culture & Médias" />
                    <option value="Cyberguerre & Numérique" />
                  </datalist>
                </div>
              </div>

              {/* Slug URL */}
              <div>
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
                  className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                />
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
                  className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition resize-y leading-relaxed"
                />
              </div>

              {/* Image de couverture (Upload ou URL) */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-accentLight" />
                    <span>Image de couverture</span>
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retirer l&apos;image</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                      id="articleImageFileInput"
                      disabled={isProcessingImage}
                    />
                    <label
                      htmlFor="articleImageFileInput"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary/80 hover:bg-brand-secondary text-brand-cream hover:text-white border border-brand-accent/40 text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      {isProcessingImage ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Traitement de l&apos;image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-brand-accentLight" />
                          <span>Téléverser depuis l&apos;ordinateur</span>
                        </>
                      )}
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={coverImage.startsWith("data:") ? "" : coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder={coverImage.startsWith("data:") ? "Image téléversée prête" : "Ou coller une URL https://..."}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition"
                    />
                  </div>
                </div>

                {coverImage && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Prévisualisation couverture"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-white">
                      Aperçu couverture
                    </span>
                  </div>
                )}
              </div>

              {/* Contenu Markdown / Texte */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Corps de l&apos;article (Markdown supporté) *
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">Titres ##, citations &gt;, listes -</span>
                </div>
                <textarea
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                  placeholder="Rédigez le déroulé de votre enquête, les citations de témoins, les chiffres clés..."
                  className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 font-sans placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition resize-y leading-relaxed"
                />
              </div>

              {/* Statut : Brouillon ou Publié */}
              <div className="p-4 rounded-2xl bg-brand-primary/40 border border-brand-accent/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-brand-accentLight" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Statut de publication :</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isPublished
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {isPublished ? "Publié en direct sur le site" : "Brouillon privé"}
                      </span>
                    </div>
                    <div className="text-[11px] text-brand-cream/70 mt-0.5">
                      {isPublished
                        ? "Visible immédiatement par les lecteurs sur la vitrine."
                        : "Conservé en rédaction, masqué du public."}
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
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentLight text-white text-xs font-bold shadow-lg shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
