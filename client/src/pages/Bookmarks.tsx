import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Article } from "@/types";
import { Bookmark, Loader2 } from "lucide-react";

export default function Bookmarks() {
  const [page, setPage] = useState(1);
  
  const { data: bookmarksResponse, isLoading } = useQuery({
    queryKey: ["/api/user/bookmarks", { page }],
    queryFn: async () => {
      const response = await fetch(`/api/user/bookmarks?page=${page}&limit=10`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      return response.json();
    },
  });

  const hasMore = bookmarksResponse ? 
    page * 10 < bookmarksResponse.total : false;

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Bookmark className="h-8 w-8 text-indonesia-red" />
            <h1 className="text-3xl font-bold text-gray-900">Bookmark Saya</h1>
          </div>
          <p className="text-gray-600">
            {bookmarksResponse?.total || 0} artikel tersimpan
          </p>
        </div>

        {bookmarksResponse?.bookmarks.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {bookmarksResponse.bookmarks.map((article: Article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    "Muat Lebih Banyak"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Bookmark
              </h2>
              <p className="text-gray-600 mb-6">
                Mulai bookmark artikel yang menarik untuk dibaca nanti
              </p>
              <Button asChild className="bg-indonesia-red hover:bg-indonesia-red/90">
                <a href="/">Jelajahi Artikel</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
