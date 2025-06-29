import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Article, Comment } from "@/types";
import { Heart, MessageCircle, Bookmark, User, Calendar, Loader2 } from "lucide-react";

const commentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong").max(1000, "Komentar maksimal 1000 karakter"),
});

type CommentFormData = z.infer<typeof commentSchema>;

export default function ArticleDetail() {
  const params = useParams();
  const { slug } = params as { slug: string };
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch article
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["/api/articles", slug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Artikel tidak ditemukan");
        }
        throw new Error("Gagal memuat artikel");
      }
      return response.json() as Promise<Article>;
    },
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/articles", article?.id, "comments"],
    queryFn: async () => {
      if (!article?.id) return [];
      const response = await fetch(`/api/articles/${article.id}/comments`);
      if (!response.ok) throw new Error("Gagal memuat komentar");
      return response.json() as Promise<Comment[]>;
    },
    enabled: !!article?.id,
  });

  // Comment form
  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/articles/${article!.id}/like`),
    onSuccess: async (response) => {
      const data = await response.json();
      setIsLiked(data.isLiked);
      toast({ description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", slug] });
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
    mutationFn: () => apiRequest("POST", `/api/articles/${article!.id}/bookmark`),
    onSuccess: async (response) => {
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
      toast({ description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", slug] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memproses bookmark",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data: CommentFormData) =>
      apiRequest("POST", `/api/articles/${article!.id}/comments`, data),
    onSuccess: async (response) => {
      const result = await response.json();
      toast({ description: result.message });
      commentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/articles", article!.id, "comments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengirim komentar",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
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

  const handleBookmark = () => {
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

  const onSubmitComment = (data: CommentFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Diperlukan",
        description: "Anda harus login untuk berkomentar",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(data);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (articleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Artikel Tidak Ditemukan</h1>
            <p className="text-gray-600">
              Artikel yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Article Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Badge
            style={{ backgroundColor: article.category.color }}
            className="text-white"
          >
            {article.category.name}
          </Badge>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          {article.excerpt}
        </p>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-1 text-gray-500">
            <User className="h-4 w-4" />
            <span>{article.author.fullName}</span>
          </div>
        </div>

        {/* Article Actions */}
        <div className="flex items-center space-x-4 pb-6 border-b">
          <Button
            variant="outline"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? 'text-red-500 border-red-500' : ''}`}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{article._count.likes}</span>
            <span>Suka</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{article._count.comments}</span>
            <span>Komentar</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleBookmark}
            className={`flex items-center space-x-2 ${isBookmarked ? 'text-blue-500 border-blue-500' : ''}`}
            disabled={bookmarkMutation.isPending}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{article._count.bookmarks}</span>
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="mb-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Comments Section */}
      <section id="comments" className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Komentar ({comments.length})
        </h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Tulis komentar Anda..."
                    {...commentForm.register("content")}
                    rows={4}
                  />
                  {commentForm.formState.errors.content && (
                    <p className="text-sm text-red-600 mt-1">
                      {commentForm.formState.errors.content.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Komentar akan direview sebelum dipublikasikan
                  </p>
                  <Button
                    type="submit"
                    disabled={commentMutation.isPending}
                    className="bg-indonesia-red hover:bg-indonesia-red/90"
                  >
                    {commentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Komentar"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Silakan login untuk memberikan komentar
              </p>
              <Button asChild className="bg-indonesia-red hover:bg-indonesia-red/90">
                <a href="/login">Login</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.fullName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada komentar untuk artikel ini</p>
          </div>
        )}
      </section>
    </main>
  );
}
