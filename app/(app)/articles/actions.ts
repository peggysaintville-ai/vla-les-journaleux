"use server";

import { revalidatePath } from "next/cache";
import { saveArticle, togglePublishArticle, deleteArticle } from "@/lib/articles";
import { z } from "zod";

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit comporter que des lettres minuscules, chiffres et tirets"),
  excerpt: z.string().min(5, "L'extrait doit contenir au moins 5 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  coverImage: z.string().optional(),
  isPublished: z.boolean(),
});

export async function saveArticleAction(prevState: unknown, formData: FormData) {
  const rawId = formData.get("id")?.toString();
  const rawTitle = formData.get("title")?.toString() || "";
  let rawSlug = formData.get("slug")?.toString() || "";
  const rawExcerpt = formData.get("excerpt")?.toString() || "";
  const rawContent = formData.get("content")?.toString() || "";
  const rawCoverImage = formData.get("coverImage")?.toString();
  const rawIsPublished = formData.get("isPublished") === "true";

  if (!rawSlug.trim()) {
    rawSlug = rawTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const parsed = articleSchema.safeParse({
    id: rawId || undefined,
    title: rawTitle,
    slug: rawSlug,
    excerpt: rawExcerpt,
    content: rawContent,
    coverImage: rawCoverImage || undefined,
    isPublished: rawIsPublished,
  });

  if (!parsed.success) {
    const err = parsed.error.issues[0]?.message || "Données invalides";
    return { success: false, error: err };
  }

  try {
    const saved = await saveArticle(parsed.data);
    revalidatePath("/articles");
    revalidatePath("/");
    revalidatePath(`/articles/${saved.slug}`);
    return {
      success: true,
      message: parsed.data.isPublished
        ? "Article publié avec succès sur le site vitrine !"
        : "Brouillon sauvegardé avec succès.",
      article: saved,
    };
  } catch (e) {
    console.error("Erreur sauvegarde article :", e);
    return { success: false, error: "Impossible de sauvegarder l'article." };
  }
}

export async function togglePublishAction(id: string) {
  try {
    const newState = await togglePublishArticle(id);
    revalidatePath("/articles");
    revalidatePath("/");
    return {
      success: true,
      isPublished: newState,
      message: newState ? "Article publié sur la vitrine." : "Article retiré de la vitrine.",
    };
  } catch (e) {
    console.error("Erreur bascule publication :", e);
    return { success: false, error: "Impossible de modifier la publication." };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await deleteArticle(id);
    revalidatePath("/articles");
    revalidatePath("/");
    return { success: true, message: "Article supprimé." };
  } catch (e) {
    console.error("Erreur suppression article :", e);
    return { success: false, error: "Impossible de supprimer l'article." };
  }
}
