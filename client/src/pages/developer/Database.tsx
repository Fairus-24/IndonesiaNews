import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function DatabaseManager() {
  const [activeTable, setActiveTable] = useState("articles");
  const [editRow, setEditRow] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const tables = ["articles", "categories", "users", "comments", "bookmarks", "likes"];

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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghapus data");
      }
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
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menyimpan data");
      }
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
        {/* <Button size="sm" className="ml-2" onClick={() => setShowAdd(true)}>Tambah Data</Button> */}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTable} onValueChange={setActiveTable} className="mb-4">
          <TabsList>
            {tables.map((table) => (
              <TabsTrigger key={table} value={table}>
                {table.charAt(0).toUpperCase() + table.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
                        <Button size="sm" variant="outline" onClick={() => setEditRow(row)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => deleteMutation.mutate(row.id)}>Hapus</Button>
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
      {/*
      <Dialog open={showAdd} onOpenChange={v => !v && setShowAdd(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Data</DialogTitle></DialogHeader>
          <EditForm row={{}} columns={dbData.columns} onSave={upsertMutation.mutate} onCancel={() => setShowAdd(false)} />
        </DialogContent>
      </Dialog>
      */}
    </Card>
  );
}

// Form komponen untuk edit/tambah data
function EditForm({ row, columns, onSave, onCancel }: { row: any, columns: string[], onSave: (data: any) => void, onCancel: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues: row });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-2 w-full max-w-[95vw] sm:max-w-lg mx-auto grid grid-cols-1 gap-3 p-2">
      {columns.filter(col => col !== "id").map(col => (
        <div key={col} className="flex flex-col">
          <label className="block text-xs font-bold mb-1" htmlFor={col}>{col}</label>
          <Input {...register(col)} id={col} className="w-full" />
        </div>
      ))}
      <DialogFooter className="flex flex-row gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit">Simpan</Button>
      </DialogFooter>
    </form>
  );
}
