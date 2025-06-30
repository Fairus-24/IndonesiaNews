import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCard from "@/components/ArticleCard";
import { Article, Category } from "@/types";
import { Loader2, Filter } from "lucide-react";
import { useLocation } from "wouter";

interface CategoryPageProps {
  categorySlug: string;
}

export default function CategoryPage({ categorySlug }: CategoryPageProps) {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [categorySlug]);

  // Fetch category info
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json() as Promise<Category[]>;
    },
  });

  // Find current category
  const currentCategory = categories?.find(cat => cat.slug === categorySlug);

  // Fetch articles for this category
  const { data: articlesResponse, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles", { page, category: categorySlug }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        published: "true",
        category: categorySlug,
      });
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Update articles when new data arrives
  useEffect(() => {
    if (articlesResponse?.articles) {
      if (page === 1) {
        setArticles(articlesResponse.articles);
      } else {
        setArticles(prev => [...prev, ...articlesResponse.articles]);
      }
    }
  }, [articlesResponse, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = articlesResponse ? 
    page * 10 < articlesResponse.total : false;

  if (articlesLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentCategory && !articlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategori Tidak Ditemukan</h1>
          <p className="text-gray-600">Kategori "{categorySlug}" tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: currentCategory?.color || '#DC2626' }}
          >
            <Filter className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentCategory?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
            </h1>
            <p className="text-gray-600">
              {articlesResponse?.total || 0} artikel ditemukan dalam kategori ini
            </p>
          </div>
        </div>

        {/* Category Badge */}
        {currentCategory && (
          <Badge
            style={{ backgroundColor: currentCategory.color }}
            className="text-white text-sm px-4 py-2"
          >
            {currentCategory.name}
          </Badge>
        )}
      </div>

      {/* Category Filter Tabs */}
      {categories && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pilih Kategori Lain</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/")}
              >
                Semua
              </Button>
              {categories.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={categorySlug === cat.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocation(`/category/${cat.slug}`)}
                  className={categorySlug === cat.slug ? "bg-indonesia-red hover:bg-indonesia-red/90" : ""}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={articlesLoading}
              variant="outline"
              size="lg"
            >
              {articlesLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                "Muat Lebih Banyak Berita"
              )}
            </Button>
          </div>
        )}

        {/* No Results */}
        {articles.length === 0 && !articlesLoading && (
          <div className="text-center py-12">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Belum ada artikel dalam kategori "{currentCategory?.name || categorySlug}".
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
