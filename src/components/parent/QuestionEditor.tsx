"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MathPreview } from "@/components/math/MathPreview";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: number;
  name: string;
  form: number;
  icon: string;
}

export interface QuestionFormData {
  topicId: string;
  type: "mcq" | "fill_blank" | "calculation";
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  correctOption: string;
  explanation: string;
  points: string;
}

interface QuestionEditorProps {
  initialData?: {
    id?: number;
    topicId: number;
    type: string;
    difficulty: string;
    questionText: string;
    options: string | null;
    correctAnswer: string;
    explanation: string | null;
    points: number;
  };
  isEdit?: boolean;
}

const emptyForm: QuestionFormData = {
  topicId: "",
  type: "mcq",
  difficulty: "easy",
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  correctOption: "A",
  explanation: "",
  points: "",
};

export function QuestionEditor({ initialData, isEdit = false }: QuestionEditorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState<QuestionFormData>(() => {
    if (!initialData) return emptyForm;
    let parsedOptions: string[] = [];
    if (initialData.options) {
      try { parsedOptions = JSON.parse(initialData.options); } catch { parsedOptions = []; }
    }
    return {
      topicId: String(initialData.topicId),
      type: initialData.type as "mcq" | "fill_blank" | "calculation",
      difficulty: initialData.difficulty as "easy" | "medium" | "hard",
      questionText: initialData.questionText,
      optionA: parsedOptions[0] || "",
      optionB: parsedOptions[1] || "",
      optionC: parsedOptions[2] || "",
      optionD: parsedOptions[3] || "",
      correctAnswer: initialData.correctAnswer,
      correctOption: initialData.type === "mcq" && parsedOptions.includes(initialData.correctAnswer)
        ? String.fromCharCode(65 + parsedOptions.indexOf(initialData.correctAnswer))
        : "A",
      explanation: initialData.explanation || "",
      points: String(initialData.points || ""),
    };
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/topics").then(r => r.json()).then(setTopics);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!form.topicId || !form.questionText.trim()) {
      setError("Sila pilih topik dan isi soalan");
      setSaving(false);
      return;
    }

    const options = form.type === "mcq"
      ? [form.optionA, form.optionB, form.optionC, form.optionD]
      : null;

    const correctAnswer = form.type === "mcq"
      ? options![form.correctOption.charCodeAt(0) - 65]
      : form.correctAnswer;

    if (!correctAnswer || !correctAnswer.trim()) {
      setError("Sila isi jawapan betul");
      setSaving(false);
      return;
    }

    const url = isEdit && initialData?.id
      ? `/api/questions/${initialData.id}`
      : "/api/questions";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId: form.topicId,
        type: form.type,
        difficulty: form.difficulty,
        questionText: form.questionText,
        options,
        correctAnswer,
        explanation: form.explanation || null,
        points: form.points || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ralat menyimpan");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  }

  const selectedTopic = topics.find(t => String(t.id) === form.topicId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/parent/questions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Soalan" : "Tambah Soalan"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Kemas kini soalan sedia ada" : "Cipta soalan matematik baru"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Topik *</Label>
            <Select value={form.topicId} onValueChange={(v) => v && setForm({ ...form, topicId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih topik" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.icon} T{t.form}: {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Jenis Soalan *</Label>
            <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as typeof form.type })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Pilihan A/B/C/D</SelectItem>
                <SelectItem value="fill_blank">Isi Tempat Kosong</SelectItem>
                <SelectItem value="calculation">Pengiraan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aras Kesukaran *</Label>
            <Select value={form.difficulty} onValueChange={(v) => v && setForm({ ...form, difficulty: v as typeof form.difficulty })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Senang</SelectItem>
                <SelectItem value="medium">Sederhana</SelectItem>
                <SelectItem value="hard">Susah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="qtext">Teks Soalan *</Label>
          <p className="text-xs text-muted-foreground mb-1">
            Guna <code>$...$</code> untuk formula inline, <code>$$...$$</code> untuk formula blok
          </p>
          <details className="text-xs text-muted-foreground mb-2">
            <summary className="cursor-pointer hover:text-foreground">Panduan LaTeX (klik untuk lihat)</summary>
            <div className="mt-1 p-2 border rounded bg-muted/30 space-y-0.5">
              <p><code>{'\\frac{a}{b}'}</code> → pecahan</p>
              <p><code>{'\\sqrt{x}'}</code> → punca kuasa dua</p>
              <p><code>{'x^{2}'}</code> → kuasa dua</p>
              <p><code>{'x^{3}'}</code> → kuasa tiga</p>
              <p><code>{'\\times'}</code> → darab (×)</p>
              <p><code>{'\\div'}</code> → bahagi (÷)</p>
              <p><code>{'\\pi'}</code> → pi (π)</p>
              <p><code>{'\\geq'}</code> → ≥ &nbsp; <code>{'\\leq'}</code> → ≤</p>
              <p><code>{'\\neq'}</code> → ≠ &nbsp; <code>{'\\approx'}</code> → ≈</p>
              <p><code>{'\\cdot'}</code> → titik darab (·)</p>
              <p><code>{'\\%'}</code> → peratus</p>
              <p><code>{'\\theta'}</code> → θ &nbsp; <code>{'\\alpha'}</code> → α</p>
            </div>
          </details>
          <Textarea
            id="qtext"
            value={form.questionText}
            onChange={(e) => setForm({ ...form, questionText: e.target.value })}
            placeholder="Cth: Cari nilai $x$ jika $$2x + 6 = 14$$"
            rows={3}
          />
        </div>

        <MathPreview value={form.questionText} label="Pratonton soalan akan muncul di sini" />

        {form.type === "mcq" && (
          <div className="space-y-3 p-4 border rounded-md">
            <Label>Pilihan Jawapan</Label>
            <div className="grid grid-cols-1 gap-2">
              {["A", "B", "C", "D"].map((opt) => {
                const key = `option${opt}` as keyof QuestionFormData;
                return (
                  <div key={opt} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                        {opt}
                      </span>
                      <Input
                        value={form[key] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={`Taip pilihan ${opt} (guna $latex$ jika perlu)`}
                        className="flex-1"
                      />
                    </div>
                    <MathPreview value={form[key] as string} label={`Pratonton pilihan ${opt}`} />
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <Label>Jawapan Betul</Label>
              <Select value={form.correctOption} onValueChange={(v) => v && setForm({ ...form, correctOption: v })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((opt) => (
                    <SelectItem key={opt} value={opt}>Pilihan {opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(form.type === "fill_blank" || form.type === "calculation") && (
          <div>
            <Label htmlFor="cans">Jawapan Betul *</Label>
            <p className="text-xs text-muted-foreground mb-1">Guna LaTeX jika perlu (cth: 3.14)</p>
            <Input
              id="cans"
              value={form.correctAnswer}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              placeholder="Jawapan yang betul"
            />
            <MathPreview value={form.correctAnswer} label="Pratonton jawapan" />
          </div>
        )}

        <div>
          <Label htmlFor="explain">Penjelasan (pilihan)</Label>
          <Textarea
            id="explain"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            placeholder="Langkah penyelesaian..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="pts">Point (pilihan — guna default ikut aras jika dikosongkan)</Label>
          <Input
            id="pts"
            type="number"
            min="1"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })}
            placeholder="Default ikut aras"
            className="w-32"
          />
        </div>

        {selectedTopic && (
          <div className="text-sm text-muted-foreground">
            Topik: <strong>{selectedTopic.name}</strong> · Tingkatan {selectedTopic.form} · aras {form.difficulty}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && !isEdit && (
          <p className="text-sm text-green-600">
            Soalan berjaya disimpan! <Link href="/parent/questions/new" className="underline">Tambah lagi</Link> atau <Link href="/parent/questions" className="underline">kembali ke senarai</Link>
          </p>
        )}
        {saved && isEdit && (
          <p className="text-sm text-green-600">
            Soalan berjaya dikemaskini! <Link href="/parent/questions" className="underline">Kembali ke senarai</Link>
          </p>
        )}

        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Menyimpan..." : isEdit ? "Kemas Kini" : "Simpan Soalan"}
        </Button>
      </form>
    </div>
  );
}