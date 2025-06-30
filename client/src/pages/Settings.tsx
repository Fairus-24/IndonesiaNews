
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Save,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  if (data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Password konfirmasi tidak cocok atau password lama diperlukan",
  path: ["confirmPassword"]
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswords, setShowPasswords] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    articleNotifications: true,
    commentNotifications: true
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormData>) => {
      return apiRequest("/api/user/profile", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      form.reset({
        fullName: form.getValues("fullName"),
        email: form.getValues("email"),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui profil",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: typeof notifications) => {
      return apiRequest("/api/user/notifications", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Pengaturan notifikasi berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui pengaturan notifikasi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const updateData: any = {
      fullName: data.fullName,
      email: data.email,
    };

    if (data.newPassword && data.currentPassword) {
      updateData.currentPassword = data.currentPassword;
      updateData.newPassword = data.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    updateNotificationsMutation.mutate(newNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-indonesia-red" />
            Pengaturan Akun
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola pengaturan akun dan preferensi Anda
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifikasi</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Keamanan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        {...form.register("fullName")}
                        className="mt-1"
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        className="mt-1"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ubah Password</h3>
                    <p className="text-sm text-gray-600">
                      Kosongkan jika tidak ingin mengubah password
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="currentPassword">Password Lama</Label>
                        <div className="relative mt-1">
                          <Input
                            id="currentPassword"
                            type={showPasswords ? "text" : "password"}
                            {...form.register("currentPassword")}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <Input
                          id="newPassword"
                          type={showPasswords ? "text" : "password"}
                          {...form.register("newPassword")}
                          className="mt-1"
                        />
                        {form.formState.errors.newPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showPasswords ? "text" : "password"}
                          {...form.register("confirmPassword")}
                          className="mt-1"
                        />
                        {form.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-indonesia-red hover:bg-indonesia-red/90"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Email</h4>
                    <p className="text-sm text-gray-600">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(value) => handleNotificationChange("emailNotifications", value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Artikel Baru</h4>
                    <p className="text-sm text-gray-600">
                      Dapatkan notifikasi saat ada artikel baru
                    </p>
                  </div>
                  <Switch
                    checked={notifications.articleNotifications}
                    onCheckedChange={(value) => handleNotificationChange("articleNotifications", value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Komentar</h4>
                    <p className="text-sm text-gray-600">
                      Dapatkan notifikasi saat ada balasan komentar
                    </p>
                  </div>
                  <Switch
                    checked={notifications.commentNotifications}
                    onCheckedChange={(value) => handleNotificationChange("commentNotifications", value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Status Keamanan</h4>
                  <p className="text-sm text-blue-700">
                    Akun Anda aman. Login terakhir: {new Date().toLocaleDateString('id-ID')}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Informasi Akun</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Role:</span> {user?.role}</p>
                    <p><span className="font-medium">Tanggal Daftar:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
