import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/ArticleCard";
import { Loader2 } from "lucide-react";
import { Article } from "@/types";

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);

  // Update search state whenever URL changes (per keywoard)
  useEffect(() => {
    const updateSearch = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setSearch(urlParams.get("search") || "");
    };
    updateSearch();
    window.addEventListener("popstate", updateSearch);
    window.addEventListener("pushstate", updateSearch);
    window.addEventListener("replacestate", updateSearch);
    // Custom event for SPA navigation
    const origPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      origPushState.apply(this, args);
      window.dispatchEvent(new Event("pushstate"));
    };
    const origReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      origReplaceState.apply(this, args);
      window.dispatchEvent(new Event("replacestate"));
    };
    return () => {
      window.removeEventListener("popstate", updateSearch);
      window.removeEventListener("pushstate", updateSearch);
      window.removeEventListener("replacestate", updateSearch);
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [search]);

  const { data: articlesResponse, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles", { page, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        published: "true",
        ...(search ? { search } : {}),
      });
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    enabled: !!search,
  });

  useEffect(() => {
    if (articlesResponse?.articles) {
      setArticles(articlesResponse.articles);
    }
  }, [articlesResponse, search]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Hasil Pencarian: "{search}"
      </h1>
      {articlesLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Tidak ada artikel ditemukan.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article: Article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
