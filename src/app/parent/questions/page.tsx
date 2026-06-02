"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Upload, Calculator } from "lucide-react";
import Link from "next/link";

interface QuestionItem {
  id: number;
  type: string;
  difficulty: string;
  questionText: string;
  correctAnswer: string;
  points: number;
  topic: { id: number; name: string; form: number };
}

interface TopicItem {
  id: number;
  name: string;
  form: number;
  icon: string;
}

export default function QuestionsListPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/topics").then(r => r.json()).then(setTopics);
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterTopic) params.set("topicId", filterTopic);
    if (filterType) params.set("type", filterType);
    if (filterDifficulty) params.set("difficulty", filterDifficulty);
    if (search) params.set("search", search);
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setQuestions(data);
    setLoading(false);
  }, [filterTopic, filterType, filterDifficulty, search]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  function handleSearch() {
    fetchQuestions();
  }

  async function handleDelete(id: number) {
    if (!confirm("Padam soalan ini?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  }

  function typeLabel(t: string) {
    if (t === "mcq") return "A/B/C/D";
    if (t === "fill_blank") return "Isi Kosong";
    return "Pengiraan";
  }

  function diffColor(d: string) {
    if (d === "easy") return "bg-green-100 text-green-800";
    if (d === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  function diffLabel(d: string) {
    if (d === "easy") return "Senang";
    if (d === "medium") return "Sederhana";
    return "Susah";
  }

  function truncate(text: string, max: number) {
    return text.length > max ? text.substring(0, max) + "..." : text;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Soalan</h1>
          <p className="text-muted-foreground">Urus bank soalan matematik</p>
        </div>
        <div className="flex gap-2">
          <Link href="/parent/questions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Tambah Soalan
            </Button>
          </Link>
          <Link href="/parent/questions/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" /> Muat Naik
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Select value={filterTopic} onValueChange={(v) => v ? setFilterTopic(v) : setFilterTopic("")}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Topik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Topik</SelectItem>
                  {topics.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.icon} T{t.form}: {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Select value={filterType} onValueChange={(v) => v ? setFilterType(v) : setFilterType("")}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="mcq">A/B/C/D</SelectItem>
                  <SelectItem value="fill_blank">Isi Kosong</SelectItem>
                  <SelectItem value="calculation">Pengiraan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Select value={filterDifficulty} onValueChange={(v) => v ? setFilterDifficulty(v) : setFilterDifficulty("")}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Aras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aras</SelectItem>
                  <SelectItem value="easy">Senang</SelectItem>
                  <SelectItem value="medium">Sederhana</SelectItem>
                  <SelectItem value="hard">Susah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input placeholder="Cari soalan..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-center text-muted-foreground py-8">Memuatkan...</p>}

      {!loading && questions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Soalan</h3>
            <p className="text-muted-foreground mb-4">Tambah soalan secara manual atau muat naik CSV</p>
            <div className="flex gap-2 justify-center">
              <Link href="/parent/questions/new">
                <Button><Plus className="h-4 w-4 mr-2" /> Tambah Soalan</Button>
              </Link>
              <Link href="/parent/questions/import">
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Muat Naik CSV</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && questions.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Soalan</TableHead>
                <TableHead>Topik</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Aras</TableHead>
                <TableHead>Point</TableHead>
                <TableHead className="w-[100px]">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={q.questionText}>
                      {truncate(q.questionText, 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">T{q.topic.form}: {q.topic.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabel(q.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={diffColor(q.difficulty)}>{diffLabel(q.difficulty)}</Badge>
                  </TableCell>
                  <TableCell>{q.points}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/parent/questions/${q.id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}