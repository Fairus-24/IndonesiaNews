import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Statistics } from "@/types";
import { Link } from "wouter";
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageCircle, 
  Heart, 
  Bookmark,
  TrendingUp,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/statistics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/statistics", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json() as Promise<Statistics>;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Artikel",
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      },
    {
      title: "Total Pengguna",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      title: "Total Komentar",
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
    },
    {
      title: "Total Suka",
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
    {
      title: "Total Bookmark",
      value: stats?.totalBookmarks || 0,
      icon: Bookmark,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <ProtectedRoute roles={["ADMIN", "DEVELOPER"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indonesia-red rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Kelola konten dan statistik website</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className={`${stat.borderColor} border`}>
              <CardContent className={`p-6 ${stat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${stat.color}`}>
                      {stat.title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value.toLocaleString("id-ID")}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">Aktif</span>
                      <span className="text-sm text-gray-500 ml-1">sistem berjalan</span>
                    </div>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="content">Konten</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Total Artikel</p>
                        <p className="text-sm text-gray-500">Artikel yang telah diterbitkan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indonesia-red">{stats?.totalArticles || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Total Pengguna</p>
                        <p className="text-sm text-gray-500">Pengguna terdaftar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indonesia-red">{stats?.totalUsers || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Total Komentar</p>
                        <p className="text-sm text-gray-500">Komentar dari pengguna</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indonesia-red">{stats?.totalComments || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Sistem</span> berjalan normal
                        </p>
                        <p className="text-xs text-gray-500">Semua layanan aktif</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Database</span> terhubung
                        </p>
                        <p className="text-xs text-gray-500">Koneksi stabil</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Upload</span> sistem aktif
                        </p>
                        <p className="text-xs text-gray-500">File upload berfungsi</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">API</span> endpoint aktif
                        </p>
                        <p className="text-xs text-gray-500">Semua layanan API berjalan</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Link href="/admin/articles">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">Manajemen Artikel</CardTitle>
                    <FileText className="h-6 w-6 text-indonesia-red" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats?.totalArticles || 0} Artikel</p>
                    <p className="text-sm text-gray-600 mt-2">Kelola artikel, tambah konten baru, edit atau hapus artikel</p>
                    <Button className="mt-4 bg-indonesia-red hover:bg-indonesia-red/90" size="sm">
                      Kelola Artikel →
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/comments">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">Moderasi Komentar</CardTitle>
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats?.totalComments || 0} Komentar</p>
                    <p className="text-sm text-gray-600 mt-2">Setujui atau tolak komentar yang masuk</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700" size="sm">
                      Kelola Komentar →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Quick Statistics Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">Total Artikel</span>
                      <span className="text-xl font-bold text-blue-600">{stats?.totalArticles || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">Total Pengguna</span>
                      <span className="text-xl font-bold text-green-600">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-900">Total Komentar</span>
                      <span className="text-xl font-bold text-yellow-600">{stats?.totalComments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interaksi Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-900">Total Suka</span>
                      <span className="text-xl font-bold text-red-600">{stats?.totalLikes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-900">Total Bookmark</span>
                      <span className="text-xl font-bold text-purple-600">{stats?.totalBookmarks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Total Interaksi</span>
                      <span className="text-xl font-bold text-gray-600">{(stats?.totalLikes || 0) + (stats?.totalComments || 0) + (stats?.totalBookmarks || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengguna per Peran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Pengguna</span>
                      <span className="text-sm font-medium">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Artikel</span>
                      <span className="text-sm font-medium">{stats?.totalArticles || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Komentar</span>
                      <span className="text-sm font-medium">{stats?.totalComments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Suka</span>
                      <span className="text-sm font-medium">{stats?.totalLikes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Bookmark</span>
                      <span className="text-sm font-medium">{stats?.totalBookmarks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rata-rata per Artikel</span>
                      <span className="text-sm font-medium">{stats?.totalArticles ? Math.round(((stats?.totalLikes || 0) + (stats?.totalComments || 0)) / stats.totalArticles) : 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </ProtectedRoute>
  );
}
