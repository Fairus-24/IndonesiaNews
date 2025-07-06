import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Users, BookOpen, MessageCircle, Bookmark, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Database() {
  const [activeTable, setActiveTable] = useState("articles");
  const [editRow, setEditRow] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: "edit" | "delete" | "add"; data?: any }>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const tables = [
    { key: "articles", label: "Artikel", icon: <BookOpen className="w-4 h-4 mr-1" /> },
    { key: "categories", label: "Kategori", icon: <Table className="w-4 h-4 mr-1" /> },
    { key: "users", label: "User", icon: <Users className="w-4 h-4 mr-1" /> },
    { key: "comments", label: "Komentar", icon: <MessageCircle className="w-4 h-4 mr-1" /> },
    { key: "bookmarks", label: "Bookmark", icon: <Bookmark className="w-4 h-4 mr-1" /> },
    { key: "likes", label: "Like", icon: <ThumbsUp className="w-4 h-4 mr-1" /> },
  ];

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dbData = {}, isLoading } = useQuery({
    queryKey: ["/api/dev/db", activeTable],
    queryFn: async () => {
      const res = await fetch(`/api/dev/db?table=${activeTable}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!res.ok) throw new Error("Gagal mengambil data database");
      return res.json();
    },
  });

  // CRUD mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: any) => {
      const res = await fetch(`/api/dev/db?table=${activeTable}&id=${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!res.ok) throw new Error("Gagal menghapus data");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Data berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["/api/dev/db", activeTable] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/dev/db?table=${activeTable}`, {
        method: data.id ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Data berhasil disimpan" });
      setEditRow(null); setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dev/db", activeTable] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Manajemen Database</CardTitle>
        <Button size="sm" className="ml-2" onClick={() => setConfirmAction({ type: "add" })}>Tambah Data</Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 w-full flex justify-center">
          <Tabs value={activeTable} onValueChange={setActiveTable}>
            <TabsList className="gap-2 bg-gray-50 border rounded-lg p-1 shadow-sm w-auto inline-flex">
              {tables.map((table) => (
                <TabsTrigger
                  key={table.key}
                  value={table.key}
                  className="flex items-center gap-1 px-4 py-2 rounded-md font-semibold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-indigo-100"
                >
                  {table.icon}
                  {table.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-xs">
                <thead>
                  <tr>
                    {dbData.columns?.map((col: string) => (
                      <th key={col} className="border px-2 py-1">{col}</th>
                    ))}
                    <th className="border px-2 py-1">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dbData.rows?.map((row: any, idx: number) => (
                    <tr key={idx}>
                      {dbData.columns.map((col: string) => (
                        <td key={col} className="border px-2 py-1 max-w-[200px] truncate" title={row[col]}>
                          {typeof row[col] === "string" && row[col].length > 60
                            ? row[col].slice(0, 60) + "..."
                            : typeof row[col] === "object" && row[col] !== null
                            ? JSON.stringify(row[col]).length > 60
                              ? JSON.stringify(row[col]).slice(0, 60) + "..."
                              : JSON.stringify(row[col])
                            : String(row[col])}
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction({ type: "edit", data: row })}>Edit</Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => setConfirmAction({ type: "delete", data: row })}>Hapus</Button>
      {/* Konfirmasi Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={v => { if (!v) { setConfirmAction(null); setConfirmChecked(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PERINGATAN KERAS!</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 font-bold mb-2">Aksi ini akan mengubah data database secara langsung. Tindakan salah dapat menyebabkan kerusakan data permanen!</div>
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={confirmChecked} onChange={e => setConfirmChecked(e.target.checked)} />
              <span>Saya paham dan bertanggung jawab atas perubahan ini.</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmAction(null); setConfirmChecked(false); }}>Batal</Button>
            <Button disabled={!confirmChecked} onClick={() => {
              if (!confirmAction) return;
              if (confirmAction.type === "delete") {
                deleteMutation.mutate(confirmAction.data.id);
              } else if (confirmAction.type === "edit") {
                setEditRow(confirmAction.data);
              } else if (confirmAction.type === "add") {
                setShowAdd(true);
              }
              setConfirmAction(null); setConfirmChecked(false);
            }}>Lanjutkan & Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dbData.truncated && (
              <div className="text-xs text-gray-500 mt-2">Hanya menampilkan 60 data pertama. Gunakan filter/pencarian untuk data lebih spesifik.</div>
            )}
          </>
        )}
      </CardContent>
      {/* Edit Dialog */}
      <Dialog open={!!editRow} onOpenChange={v => !v && setEditRow(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Data</DialogTitle></DialogHeader>
          <EditForm row={editRow} columns={dbData.columns} onSave={upsertMutation.mutate} onCancel={() => setEditRow(null)} />
        </DialogContent>
      </Dialog>
      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={v => !v && setShowAdd(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Data</DialogTitle></DialogHeader>
          <EditForm row={{}} columns={dbData.columns} onSave={upsertMutation.mutate} onCancel={() => setShowAdd(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Form komponen untuk edit/tambah data
function EditForm({ row, columns, onSave, onCancel }: { row: any, columns: string[], onSave: (data: any) => void, onCancel: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues: row });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-2">
      {columns.filter(col => col !== "id").map(col => (
        <div key={col}>
          <label className="block text-xs font-bold mb-1">{col}</label>
          <Input {...register(col)} />
        </div>
      ))}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan</Button>
      </DialogFooter>
    </form>
  );
}
