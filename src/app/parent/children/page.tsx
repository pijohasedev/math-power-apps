"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

interface Child {
  id: number;
  name: string;
  pin: string;
  avatarColor: string;
  currentPoints: number;
}

const COLORS = [
  { value: "blue", label: "Biru", bg: "bg-blue-500" },
  { value: "green", label: "Hijau", bg: "bg-green-500" },
  { value: "red", label: "Merah", bg: "bg-red-500" },
  { value: "purple", label: "Ungu", bg: "bg-purple-500" },
  { value: "orange", label: "Oren", bg: "bg-orange-500" },
  { value: "pink", label: "Merah Jambu", bg: "bg-pink-500" },
];

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [form, setForm] = useState({ name: "", pin: "", avatarColor: "blue" });
  const [error, setError] = useState("");

  useEffect(() => { fetchChildren(); }, []);

  async function fetchChildren() {
    const res = await fetch("/api/children");
    const data = await res.json();
    setChildren(data);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", pin: "", avatarColor: "blue" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(child: Child) {
    setEditing(child);
    setForm({ name: child.name, pin: child.pin, avatarColor: child.avatarColor });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || form.pin.length < 4) {
      setError("Nama dan PIN (min 4 aksara) diperlukan");
      return;
    }
    const url = editing ? `/api/children/${editing.id}` : "/api/children";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ralat");
      return;
    }
    setDialogOpen(false);
    fetchChildren();
  }

  async function handleDelete(id: number) {
    if (!confirm("Padam profil anak ini?")) return;
    await fetch(`/api/children/${id}`, { method: "DELETE" });
    fetchChildren();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil Anak</h1>
          <p className="text-muted-foreground">Urus profil anak-anak</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Anak
        </Button>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Profil</h3>
            <p className="text-muted-foreground mb-4">Tambah profil anak untuk bermula</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Anak Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.id} className="relative group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${COLORS.find(c => c.value === child.avatarColor)?.bg || "bg-blue-500"}`} />
                    <div>
                      <h3 className="font-semibold">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">PIN: {child.pin}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="secondary">{child.currentPoints} point</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Profil" : "Tambah Anak"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama anak" />
            </div>
            <div>
              <Label htmlFor="pin">PIN (4+ aksara)</Label>
              <Input id="pin" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} placeholder="PIN untuk log masuk" maxLength={8} />
            </div>
            <div>
              <Label>Warna Avatar</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm({ ...form, avatarColor: c.value })}
                    className={`w-8 h-8 rounded-full ${c.bg} ${form.avatarColor === c.value ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    title={c.label} />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}