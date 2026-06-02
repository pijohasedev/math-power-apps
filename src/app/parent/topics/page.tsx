"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

interface Topic {
  id: number;
  name: string;
  form: number;
  icon: string;
  _count: { questions: number };
}

const ICONS = ["📐", "📊", "🔢", "📏", "➕", "➗", "📈", "🧮", "🎯", "⚡"];

const LEVELS = [
  { value: "1", label: "Tahun 1" },
  { value: "2", label: "Tahun 2" },
  { value: "3", label: "Tahun 3" },
  { value: "4", label: "Tahun 4" },
  { value: "5", label: "Tahun 5" },
  { value: "6", label: "Tahun 6" },
  { value: "7", label: "Tingkatan 1" },
  { value: "8", label: "Tingkatan 2" },
  { value: "9", label: "Tingkatan 3" },
  { value: "10", label: "Tingkatan 4" },
  { value: "11", label: "Tingkatan 5" },
];

function levelLabel(form: number) {
  const level = LEVELS.find(l => l.value === String(form));
  return level ? level.label : `Tingkatan ${form}`;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [form, setForm] = useState({ name: "", form: "7", icon: "📐" });
  const [error, setError] = useState("");

  useEffect(() => { fetchTopics(); }, []);

  async function fetchTopics() {
    const res = await fetch("/api/topics");
    const data = await res.json();
    setTopics(data);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", form: "7", icon: "📐" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(topic: Topic) {
    setEditing(topic);
    setForm({ name: topic.name, form: String(topic.form), icon: topic.icon });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim()) {
      setError("Nama topik diperlukan");
      return;
    }
    const url = editing ? `/api/topics/${editing.id}` : "/api/topics";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { setError("Ralat menyimpan"); return; }
    setDialogOpen(false);
    fetchTopics();
  }

  async function handleDelete(id: number) {
    if (!confirm("Padam topik ini?")) return;
    await fetch(`/api/topics/${id}`, { method: "DELETE" });
    fetchTopics();
  }

  const grouped = LEVELS.map(l => ({
    form: parseInt(l.value),
    label: l.label,
    topics: topics.filter(t => t.form === parseInt(l.value)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Topik</h1>
          <p className="text-muted-foreground">Urus topik matematik mengikut tingkatan</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Topik
        </Button>
      </div>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Topik</h3>
            <p className="text-muted-foreground mb-4">Tambah topik untuk mula mencipta soalan</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Topik Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.form}>
              <h2 className="text-lg font-semibold mb-3">{group.label}</h2>
              {group.topics.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Tiada topik untuk tahap ini</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.topics.map(topic => (
                    <Card key={topic.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{topic.icon}</span>
                            <div>
                              <h3 className="font-semibold">{topic.name}</h3>
                              <p className="text-xs text-muted-foreground">{topic._count.questions} soalan</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(topic)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(topic.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Topik" : "Tambah Topik"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Topik</Label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cth: Algebra" />
            </div>
            <div>
              <Label>Tahun / Tingkatan</Label>
              <Select value={form.form} onValueChange={(v) => v && setForm({ ...form, form: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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