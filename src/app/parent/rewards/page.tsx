"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  isActive: boolean;
}

const ICONS = ["🎮", "🎁", "🍦", "⚽", "📱", "🎬", "🎵", "🍕", "🏀", "🎨", "📚", "🚲"];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [form, setForm] = useState({ name: "", description: "", pointsRequired: "10", icon: "🎮", isActive: true });
  const [error, setError] = useState("");

  useEffect(() => { fetchRewards(); }, []);

  async function fetchRewards() {
    const res = await fetch("/api/rewards");
    const data = await res.json();
    setRewards(data);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", pointsRequired: "10", icon: "🎮", isActive: true });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(reward: Reward) {
    setEditing(reward);
    setForm({ name: reward.name, description: reward.description, pointsRequired: String(reward.pointsRequired), icon: reward.icon, isActive: reward.isActive });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.pointsRequired) {
      setError("Nama dan point diperlukan");
      return;
    }
    const url = editing ? `/api/rewards/${editing.id}` : "/api/rewards";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { setError("Ralat menyimpan"); return; }
    setDialogOpen(false);
    fetchRewards();
  }

  async function handleDelete(id: number) {
    if (!confirm("Padam hadiah ini?")) return;
    await fetch(`/api/rewards/${id}`, { method: "DELETE" });
    fetchRewards();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hadiah</h1>
          <p className="text-muted-foreground">Cipta hadiah untuk anak redeem dengan point</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Hadiah
        </Button>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Hadiah</h3>
            <p className="text-muted-foreground mb-4">Tambah hadiah untuk anak redeem dengan point mereka</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Hadiah Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <Card key={reward.id} className={`group relative ${!reward.isActive ? "opacity-50" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{reward.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{reward.name}</h3>
                        {!reward.isActive && <Badge variant="outline">Tak Aktif</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(reward)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(reward.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <Badge className="mt-3" variant="secondary">{reward.pointsRequired} point</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Hadiah" : "Tambah Hadiah"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rname">Nama Hadiah</Label>
              <Input id="rname" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cth: 30 Minit Game" />
            </div>
            <div>
              <Label htmlFor="rdesc">Deskripsi</Label>
              <Textarea id="rdesc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Penerangan hadiah" />
            </div>
            <div>
              <Label htmlFor="rpoints">Point Diperlukan</Label>
              <Input id="rpoints" type="number" min="1" value={form.pointsRequired} onChange={e => setForm({ ...form, pointsRequired: e.target.value })} />
            </div>
            <div>
              <Label>Ikon</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ICONS.map(i => (
                  <button key={i} type="button" onClick={() => setForm({ ...form, icon: i })}
                    className={`text-xl p-2 rounded-md ${form.icon === i ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"}`}
                  >{i}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ractive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-input" />
              <Label htmlFor="ractive">Aktif (boleh diredeem)</Label>
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