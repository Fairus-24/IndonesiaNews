import { useState, useEffect, useRef } from "react";
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
        published: "true", // Explicitly request published articles
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

  // Featured slider state
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredArticles = articles.slice(0, 3);
  const sliderRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slide every 3 seconds
  useEffect(() => {
    if (!search && !category && featuredArticles.length > 1) {
      sliderRef.current = setTimeout(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredArticles.length);
      }, 3000);
      return () => {
        if (sliderRef.current) clearTimeout(sliderRef.current);
      };
    }
    return undefined;
  }, [featuredIndex, featuredArticles.length, search, category]);

  if (articlesLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breaking News Banner with Running Text */}
      {!search && !category && featuredArticles.length > 0 && (
        <div className="bg-indonesia-red text-white p-4 rounded-lg mb-8 flex items-center space-x-3 overflow-hidden relative">
          <span className="font-bold">⚡</span>
          <span className="font-medium">BERITA TERKINI:</span>
          <div className="flex-1 overflow-hidden">
            <div
              className="whitespace-nowrap animate-marquee"
              style={{ animation: "marquee 15s linear infinite" }}
            >
              {featuredArticles[0].excerpt || featuredArticles[0].description || "Tetap update dengan berita terbaru seputar Indonesia"}
            </div>
          </div>
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                display: inline-block;
          min-width: 100%;
          }
        `}
        </style>
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

      {/* Hero Section: Featured Slider */}
      {!search && !category && featuredArticles.length > 0 && (
        <section className="mb-12">
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${featuredIndex * 100}%)` }}>
                {featuredArticles.map((article) => (
                  <div key={article.id} className="min-w-full">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center mt-4 gap-2">
              {featuredArticles.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full ${idx === featuredIndex ? 'bg-indonesia-red' : 'bg-gray-300'}`}
                  onClick={() => setFeaturedIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
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
            onClick={() => window.location.href = `/category/${cat.slug}`}
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
        {articles.map((article: Article) => (
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
