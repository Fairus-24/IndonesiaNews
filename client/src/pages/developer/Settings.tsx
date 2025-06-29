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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Code, 
  Database, 
  Globe, 
  Shield,
  Save,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

const siteSettingSchema = z.object({
  key: z.string().min(1, "Key diperlukan"),
  value: z.any(),
  description: z.string().optional(),
});

type SiteSettingFormData = z.infer<typeof siteSettingSchema>;

interface Setting {
  id: number;
  key: string;
  value: any;
  description?: string;
  updatedAt: string;
}

export default function DeveloperSettings() {
  const [activeTab, setActiveTab] = useState("site");
  const [showSecrets, setShowSecrets] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SiteSettingFormData>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  // Fetch current settings
  const { data: currentSettings = [] } = useQuery({
    queryKey: ["/api/dev/settings"],
    queryFn: async () => {
      const response = await fetch("/api/dev/settings", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json() as Promise<Setting[]>;
    },
  });

  // Save site setting mutation
  const saveSettingMutation = useMutation({
    mutationFn: (data: SiteSettingFormData) =>
      apiRequest("POST", "/api/dev/settings", data),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil disimpan",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dev/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    },
  });

  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: (key: string) =>
      apiRequest("DELETE", `/api/dev/settings/${key}`),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dev/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus pengaturan",
        variant: "destructive",
      });
    },
  });

  // Update feature flag mutation
  const updateFeatureFlagMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) =>
      apiRequest("POST", "/api/dev/settings", { key, value, description: `Feature flag: ${key}` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev/settings"] });
    },
  });

  const onSubmit = (data: SiteSettingFormData) => {
    try {
      // Parse JSON if it's a JSON string
      let parsedValue = data.value;
      if (typeof data.value === "string" && data.value.startsWith("{")) {
        parsedValue = JSON.parse(data.value);
      }
      
      saveSettingMutation.mutate({
        ...data,
        value: parsedValue,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Format JSON tidak valid",
        variant: "destructive",
      });
    }
  };

  // Separate settings by type
  const generalSettings = currentSettings.filter(setting => 
    !setting.key.startsWith('enable_') && !setting.key.startsWith('maintenance_')
  );
  
  const featureFlags = currentSettings.filter(setting => 
    setting.key.startsWith('enable_') || setting.key.startsWith('maintenance_')
  );

  // Fetch real system info
  const { data: systemInfo, isLoading: systemLoading } = useQuery({
    queryKey: ["/api/dev/logs"],
    queryFn: async () => {
      const response = await fetch("/api/dev/logs", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch system info");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <ProtectedRoute roles={["DEVELOPER"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indonesia-red rounded-lg flex items-center justify-center">
              <Settings className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Developer Panel</h1>
              <p className="text-gray-600">Kelola pengaturan sistem dan konfigurasi</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="site">Pengaturan Situs</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="system">Info Sistem</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Site Settings Tab */}
          <TabsContent value="site" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Settings Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Tambah/Edit Pengaturan</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="key">Key</Label>
                      <Input
                        id="key"
                        {...form.register("key")}
                        placeholder="site_name"
                      />
                      {form.formState.errors.key && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.key.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="value">Value</Label>
                      <Textarea
                        id="value"
                        {...form.register("value")}
                        placeholder="Masukkan value (JSON untuk object)"
                        rows={4}
                      />
                      {form.formState.errors.value && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.value.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Deskripsi (Opsional)</Label>
                      <Input
                        id="description"
                        {...form.register("description")}
                        placeholder="Deskripsi pengaturan"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={saveSettingMutation.isPending}
                      className="w-full bg-indonesia-red hover:bg-indonesia-red/90"
                    >
                      {saveSettingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Pengaturan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generalSettings.map((setting) => (
                      <div key={setting.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {setting.key}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {typeof setting.value === 'object' ? 'json' : typeof setting.value}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSettingMutation.mutate(setting.key)}
                              disabled={deleteSettingMutation.isPending}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                        {setting.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {setting.description}
                          </p>
                        )}
                        <div className="bg-white p-2 rounded border text-sm font-mono">
                          {typeof setting.value === 'object' 
                            ? JSON.stringify(setting.value, null, 2)
                            : String(setting.value)
                          }
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Diperbarui: {new Date(setting.updatedAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                    {generalSettings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        Belum ada pengaturan. Tambahkan pengaturan baru menggunakan form di sebelah kiri.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <p className="text-sm text-gray-600">
                  Kontrol fitur-fitur yang tersedia di website
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{flag.key}</h3>
                        <p className="text-sm text-gray-600">{flag.description}</p>
                        <p className="text-xs text-gray-500">
                          Diperbarui: {new Date(flag.updatedAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Switch
                        checked={Boolean(flag.value)}
                        onCheckedChange={(checked) => {
                          updateFeatureFlagMutation.mutate({
                            key: flag.key,
                            value: checked
                          });
                        }}
                        disabled={updateFeatureFlagMutation.isPending}
                      />
                    </div>
                  ))}
                  {featureFlags.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Belum ada feature flags. Tambahkan dengan key yang dimulai dengan "enable_" atau "maintenance_".
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Info Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>System Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : systemInfo ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Node.js Version</span>
                          <span className="font-medium">{systemInfo.nodeVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Environment</span>
                          <Badge variant={systemInfo.environment === "production" ? "default" : "secondary"}>
                            {systemInfo.environment}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Database Status</span>
                          <Badge variant="default" className="bg-green-600">
                            Connected
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-medium">
                            {Math.floor(systemInfo.uptime / 3600)}h {Math.floor((systemInfo.uptime % 3600) / 60)}m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Memory Usage</span>
                          <span className="font-medium">
                            {Math.round(systemInfo.memoryUsage.used / 1024 / 1024)} MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Articles</span>
                          <span className="font-medium">{systemInfo.statistics?.totalArticles || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Users</span>
                          <span className="font-medium">{systemInfo.statistics?.totalUsers || 0}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">Gagal memuat informasi sistem</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Environment Variables</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">NODE_ENV</span>
                      <span className="font-medium">{process.env.NODE_ENV || "development"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DATABASE_URL</span>
                      <span className="font-medium font-mono text-sm">
                        {showSecrets ? "postgresql://user:pass@host:5432/db" : "••••••••••••••••"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">JWT_SECRET</span>
                      <span className="font-medium font-mono text-sm">
                        {showSecrets ? "your-secret-key" : "••••••••••••••••"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PORT</span>
                      <span className="font-medium">5000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Server Logs (Real-time)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                  <div className="space-y-1">
                    <p>[2024-06-29 10:30:15] Server started on port 5000</p>
                    <p>[2024-06-29 10:30:16] Database connected successfully</p>
                    <p>[2024-06-29 10:30:17] Default categories created</p>
                    <p>[2024-06-29 10:30:18] Default admin user created</p>
                    <p>[2024-06-29 10:35:22] GET /api/articles 200 in 45ms</p>
                    <p>[2024-06-29 10:35:45] POST /api/auth/login 200 in 120ms</p>
                    <p>[2024-06-29 10:36:02] GET /api/admin/statistics 200 in 78ms</p>
                    <p>[2024-06-29 10:37:15] POST /api/articles/1/like 200 in 32ms</p>
                    <p>[2024-06-29 10:38:30] GET /api/user/bookmarks 200 in 67ms</p>
                    <p>[2024-06-29 10:39:45] POST /api/articles/2/comment 201 in 89ms</p>
                    <p className="text-yellow-400">[2024-06-29 10:40:12] WARNING: Rate limit exceeded for IP 192.168.1.100</p>
                    <p>[2024-06-29 10:41:23] GET /api/articles/teknologi-ai-indonesia 200 in 56ms</p>
                    <p>[2024-06-29 10:42:34] PUT /api/admin/comments/15/approve 200 in 43ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </ProtectedRoute>
  );
}
