import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, User } from "lucide-react";
import { Article } from "@/types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  article: Article;
  showFullContent?: boolean;
}

export default function ArticleCard({ article, showFullContent = false }: ArticleCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${article.id}/like`),
    onSuccess: async (response) => {
      const data = await response.json();
      setIsLiked(data.isLiked);
      toast({
        description: data.message,
      });
      // Invalidate articles to refresh counts
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memproses like",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${article.id}/bookmark`),
    onSuccess: async (response) => {
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
      toast({
        description: data.message,
      });
      // Invalidate articles and bookmarks to refresh counts
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bookmarks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memproses bookmark",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login Diperlukan",
        description: "Anda harus login untuk menyukai artikel",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Login Diperlukan",
        description: "Anda harus login untuk bookmark artikel",
        variant: "destructive",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <Link href={`/article/${article.slug}`}>
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-48 object-cover rounded-t-lg group-hover:opacity-90 transition-opacity"
          />
        )}
      </Link>
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Badge 
            style={{ backgroundColor: article.category.color }}
            className="text-white"
          >
            {article.category.name}
          </Badge>
          <span className="text-gray-500 text-sm">
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
        </div>

        <Link href={`/article/${article.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-indonesia-red transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {showFullContent && (
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{article._count.likes}</span>
            </Button>
            
            <Link href={`/article/${article.slug}#comments`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{article._count.comments}</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`flex items-center space-x-1 ${isBookmarked ? 'text-blue-500' : ''}`}
              disabled={bookmarkMutation.isPending}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{article._count.bookmarks}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>{article.author.fullName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
