import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCard from "@/components/ArticleCard";
import { Article, Category } from "@/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [location] = useLocation();
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const category = urlParams.get('category');
  const search = urlParams.get('search');

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [category, search]);

  // Fetch articles
  const { data: articlesResponse, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/articles", { page, category, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(category && { category }),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
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

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4);
  const otherArticles = articles.slice(4);

  if (articlesLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breaking News Banner */}
      {!search && !category && (
        <div className="bg-indonesia-red text-white p-4 rounded-lg mb-8 flex items-center space-x-3">
          <span className="font-bold">⚡</span>
          <span className="font-medium">BERITA TERKINI:</span>
          <span className="flex-1">
            Tetap update dengan berita terbaru seputar Indonesia
          </span>
        </div>
      )}

      {/* Search/Filter Header */}
      {(search || category) && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {search ? `Hasil pencarian: "${search}"` : 
             category ? `Kategori: ${category.charAt(0).toUpperCase() + category.slice(1)}` : 
             "Semua Berita"}
          </h1>
          <p className="text-gray-600">
            {articlesResponse?.total || 0} artikel ditemukan
          </p>
        </div>
      )}

      {/* Hero Section */}
      {!search && !category && featuredArticle && (
        <section className="mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-2">
              <ArticleCard article={featuredArticle} />
            </div>

            {/* Side Articles */}
            <aside className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indonesia-red pb-2">
                Berita Populer
              </h3>
              
              {sideArticles.map((article) => (
                <Card key={article.id} className="group cursor-pointer">
                  <CardContent className="p-4">
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-32 object-cover rounded-lg mb-3 group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        style={{ backgroundColor: article.category.color }}
                        className="text-white text-xs"
                      >
                        {article.category.name}
                      </Badge>
                      <span className="text-gray-500 text-xs">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-indonesia-red transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </aside>
          </div>
        </section>
      )}

      {/* Category Filter Tabs */}
      {!search && categories && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category ? `Berita ${category.charAt(0).toUpperCase() + category.slice(1)}` : "Berita Terbaru"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!category ? "default" : "outline"}
                size="sm"
                onClick={() => window.location.href = "/"}
                className={!category ? "bg-indonesia-red hover:bg-indonesia-red/90" : ""}
              >
                Semua
              </Button>
              {categories.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={category === cat.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => window.location.href = `/?category=${cat.slug}`}
                  className={category === cat.slug ? "bg-indonesia-red hover:bg-indonesia-red/90" : ""}
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
          {(search || category ? articles : otherArticles).map((article) => (
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
            <p className="text-gray-600 text-lg">
              {search ? "Tidak ada artikel yang ditemukan untuk pencarian ini." :
               category ? "Tidak ada artikel dalam kategori ini." :
               "Belum ada artikel yang dipublikasikan."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
