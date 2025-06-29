import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Comment } from "@/types";
import { 
  MessageCircle, 
  Check, 
  X, 
  Trash2,
  Loader2,
  Clock
} from "lucide-react";

export default function CommentModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending comments
  const { data: pendingComments = [], isLoading } = useQuery({
    queryKey: ["/api/admin/comments/pending"],
    queryFn: async () => {
      const response = await fetch("/api/admin/comments/pending", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending comments");
      return response.json() as Promise<Comment[]>;
    },
  });

  // Approve comment mutation
  const approveMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiRequest("PUT", `/api/admin/comments/${commentId}/approve`),
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "Berhasil",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments/pending"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyetujui komentar",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiRequest("DELETE", `/api/admin/comments/${commentId}`),
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "Berhasil",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments/pending"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus komentar",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = (commentId: number) => {
    approveMutation.mutate(commentId);
  };

  const handleDelete = (commentId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleApproveAll = () => {
    if (confirm("Apakah Anda yakin ingin menyetujui semua komentar yang menunggu moderasi?")) {
      pendingComments.forEach(comment => {
        approveMutation.mutate(comment.id);
      });
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua komentar yang menunggu moderasi?")) {
      pendingComments.forEach(comment => {
        deleteMutation.mutate(comment.id);
      });
    }
  };

  return (
    <ProtectedRoute roles={["ADMIN", "DEVELOPER"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indonesia-red rounded-lg flex items-center justify-center">
              <MessageCircle className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderasi Komentar</h1>
              <p className="text-gray-600">
                Kelola komentar yang menunggu persetujuan ({pendingComments.length})
              </p>
            </div>
          </div>
          
          {pendingComments.length > 0 && (
            <div className="flex space-x-2">
              <Button
                onClick={handleApproveAll}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Setujui Semua
              </Button>
              <Button
                onClick={handleDeleteAll}
                disabled={deleteMutation.isPending}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Menunggu Moderasi</h3>
                  <p className="text-3xl font-bold text-yellow-600">{pendingComments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Komentar</h3>
                  <p className="text-3xl font-bold text-green-600">{comments.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Komentar Disetujui</h3>
                  <p className="text-3xl font-bold text-red-600">{comments.filter(comment => comment.isApproved).length}</p>
                </div>
                <X className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pendingComments.length > 0 ? (
            pendingComments.map((comment) => (
              <Card key={comment.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {comment.author.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {comment.author.fullName}
                            </span>
                            <span className="text-sm text-gray-500">
                              @{comment.author.username}
                            </span>
                            <Badge variant="outline">
                              {comment.author.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500">
                        <p>
                          <span className="font-medium">Artikel:</span>{" "}
                          Artikel ID #{comment.articleId}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(comment.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Setujui
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Tolak
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Tidak Ada Komentar Menunggu Moderasi
                </h2>
                <p className="text-gray-600">
                  Semua komentar telah dimoderasi. Komentar baru akan muncul di sini.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
