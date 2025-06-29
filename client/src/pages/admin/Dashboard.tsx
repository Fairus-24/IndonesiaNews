import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Statistics } from "@/types";
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
      change: "+12%",
    },
    {
      title: "Total Pengguna",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      change: "+18%",
    },
    {
      title: "Total Komentar",
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      change: "+7%",
    },
    {
      title: "Total Suka",
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      change: "+15%",
    },
    {
      title: "Total Bookmark",
      value: stats?.totalBookmarks || 0,
      icon: Bookmark,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      change: "+9%",
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
                      <span className="text-sm text-green-500">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">bulan ini</span>
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
                  <CardTitle>Artikel Terpopuler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Program Infrastruktur Digital</p>
                        <p className="text-sm text-gray-500">245 suka • 89 komentar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-indonesia-red">2 jam lalu</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Festival Seni Tradisional</p>
                        <p className="text-sm text-gray-500">198 suka • 67 komentar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-indonesia-red">4 jam lalu</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Timnas Indonesia Menang</p>
                        <p className="text-sm text-gray-500">156 suka • 43 komentar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-indonesia-red">6 jam lalu</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terkini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Ahmad Sutanto</span> menerbitkan artikel baru
                        </p>
                        <p className="text-xs text-gray-500">2 jam yang lalu</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Sari Wijaya</span> mengomentari artikel
                        </p>
                        <p className="text-xs text-gray-500">3 jam yang lalu</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          Komentar baru perlu moderasi
                        </p>
                        <p className="text-xs text-gray-500">4 jam yang lalu</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Eko Prasetyo</span> mendaftar sebagai pengguna baru
                        </p>
                        <p className="text-xs text-gray-500">5 jam yang lalu</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Artikel per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nasional</span>
                      <span className="text-sm font-medium">45</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ekonomi</span>
                      <span className="text-sm font-medium">32</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Olahraga</span>
                      <span className="text-sm font-medium">28</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Teknologi</span>
                      <span className="text-sm font-medium">25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Budaya</span>
                      <span className="text-sm font-medium">18</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Publikasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Diterbitkan</span>
                      <span className="text-sm font-medium text-green-600">142</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Draft</span>
                      <span className="text-sm font-medium text-yellow-600">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Menunggu Review</span>
                      <span className="text-sm font-medium text-blue-600">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderasi Komentar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Disetujui</span>
                      <span className="text-sm font-medium text-green-600">234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Menunggu Review</span>
                      <span className="text-sm font-medium text-yellow-600">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ditolak</span>
                      <span className="text-sm font-medium text-red-600">8</span>
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
                      <span className="text-sm text-gray-600">USER</span>
                      <span className="text-sm font-medium">{(stats?.totalUsers || 0) - 2}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ADMIN</span>
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">DEVELOPER</span>
                      <span className="text-sm font-medium">1</span>
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
                      <span className="text-sm text-gray-600">Aktif 24 jam terakhir</span>
                      <span className="text-sm font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aktif 7 hari terakhir</span>
                      <span className="text-sm font-medium">892</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aktif 30 hari terakhir</span>
                      <span className="text-sm font-medium">2,345</span>
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
