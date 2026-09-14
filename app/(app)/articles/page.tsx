import { getArticles } from "@/lib/articles";
import ArticlesManager from "@/components/articles-manager";

export const metadata = {
  title: "Rédaction & Articles | V'LÀ LES JOURNALEUX",
  description: "Gestion et publication des enquêtes sur le site vitrine.",
};

export default async function ArticlesPage() {
  const articles = await getArticles(true);

  return (
    <div className="max-w-7xl mx-auto">
      <ArticlesManager initialArticles={articles} />
    </div>
  );
}
