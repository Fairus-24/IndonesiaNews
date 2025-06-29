import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Article, Category } from "@/types";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload,
  Loader2 
} from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(1, "Judul artikel diperlukan"),
  slug: z.string().min(1, "Slug diperlukan"),
  excerpt: z.string().min(1, "Ringkasan diperlukan"),
  content: z.string().min(1, "Konten artikel diperlukan"),
  categoryId: z.string().min(1, "Kategori diperlukan"),
  isPublished: z.boolean(),
  coverImage: z.any().optional(),
  coverImageUrl: z.string().optional(),
  imageUploadType: z.enum(["file", "url"]).default("file"),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function ArticleManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [page, setPage] = useState(1);
  const [imageUploadType, setImageUploadType] = useState<"file" | "url">("file");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch articles
  const { data: articlesResponse, isLoading } = useQuery({
    queryKey: ["/api/articles", { page, published: "all" }],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/articles?page=${page}&limit=10&published=false`);
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return response.json() as Promise<Category[]>;
    },
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      categoryId: "",
      isPublished: false,
      coverImageUrl: "",
      imageUploadType: "file",
    },
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  // Watch title to auto-generate slug
  const watchTitle = form.watch("title");
  if (watchTitle && !editingArticle) {
    const slug = generateSlug(watchTitle);
    if (form.getValues("slug") !== slug) {
      form.setValue("slug", slug);
    }
  }

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/articles", data),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dibuat",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat artikel",
        variant: "destructive",
      });
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      apiRequest("PUT", `/api/articles/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil diperbarui",
      });
      setEditingArticle(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui artikel",
        variant: "destructive",
      });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Artikel berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus artikel",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    const isUrl = article.coverImage?.startsWith('http');
    setImageUploadType(isUrl ? "url" : "file");
    form.reset({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      categoryId: article.category.id.toString(),
      isPublished: article.isPublished,
      coverImageUrl: isUrl ? article.coverImage : "",
      imageUploadType: isUrl ? "url" : "file",
    });
    setIsCreateDialogOpen(true);
  };

  const onSubmit = (data: ArticleFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("excerpt", data.excerpt);
    formData.append("content", data.content);
    formData.append("categoryId", data.categoryId);
    formData.append("isPublished", data.isPublished ? "true" : "false");
    formData.append("imageUploadType", imageUploadType);

    if (imageUploadType === "file" && data.coverImage && data.coverImage[0]) {
      formData.append("coverImage", data.coverImage[0]);
    } else if (imageUploadType === "url" && data.coverImageUrl) {
      formData.append("coverImageUrl", data.coverImageUrl);
    }

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

    

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ProtectedRoute roles={["ADMIN", "DEVELOPER"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indonesia-red rounded-lg flex items-center justify-center">
              <FileText className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Artikel</h1>
              <p className="text-gray-600">Kelola artikel dan konten website</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indonesia-red hover:bg-indonesia-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Artikel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul Artikel</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Masukkan judul artikel"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...form.register("slug")}
                      placeholder="slug-artikel"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea
                    id="excerpt"
                    {...form.register("excerpt")}
                    placeholder="Ringkasan singkat artikel"
                    rows={3}
                  />
                  {form.formState.errors.excerpt && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.excerpt.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Konten</Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    placeholder="Konten lengkap artikel"
                    rows={10}
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryId">Kategori</Label>
                    <Select
                      value={form.watch("categoryId")}
                      onValueChange={(value) => form.setValue("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoryId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Gambar Sampul</Label>
                    <div className="space-y-3">
                      <Select
                        value={imageUploadType}
                        onValueChange={(value: "file" | "url") => {
                          setImageUploadType(value);
                          form.setValue("imageUploadType", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="file">Upload File</SelectItem>
                          <SelectItem value="url">URL Gambar</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {imageUploadType === "file" ? (
                        <Input
                          type="file"
                          accept="image/*"
                          {...form.register("coverImage")}
                        />
                      ) : (
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...form.register("coverImageUrl")}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.watch("isPublished")}
                    onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                  />
                  <Label>Publikasikan artikel</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingArticle(null);
                      setImageUploadType("file");
                      form.reset();
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-indonesia-red hover:bg-indonesia-red/90"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : editingArticle ? (
                      "Perbarui"
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikel</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articlesResponse?.articles.map((article: Article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {article.coverImage && (
                            <img
                              src={article.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {article.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Oleh: {article.author.fullName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: article.category.color }}
                          className="text-white"
                        >
                          {article.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={article.isPublished ? "default" : "secondary"}>
                          {article.isPublished ? "Diterbitkan" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(article.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/article/${article.slug}`, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(article.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {articlesResponse?.articles.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada artikel</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingArticle} onOpenChange={() => setEditingArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Artikel</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Judul Artikel</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Masukkan judul artikel"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="slug-artikel"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Ringkasan</Label>
                <Textarea
                  id="excerpt"
                  {...form.register("excerpt")}
                  placeholder="Ringkasan singkat artikel"
                  rows={3}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.excerpt.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder="Konten lengkap artikel"
                  rows={10}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Kategori</Label>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => form.setValue("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Gambar Sampul</Label>
                  <div className="space-y-3">
                    <Select
                      value={imageUploadType}
                      onValueChange={(value: "file" | "url") => {
                        setImageUploadType(value);
                        form.setValue("imageUploadType", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file">Upload File</SelectItem>
                        <SelectItem value="url">URL Gambar</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {imageUploadType === "file" ? (
                      <Input
                        type="file"
                        accept="image/*"
                        {...form.register("coverImage")}
                      />
                    ) : (
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...form.register("coverImageUrl")}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch("isPublished")}
                  onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                />
                <Label>Publikasikan artikel</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingArticle(null);
                    setImageUploadType("file");
                    form.reset();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-indonesia-red hover:bg-indonesia-red/90"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    "Perbarui"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
}
