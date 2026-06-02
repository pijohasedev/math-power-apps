"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Download, Loader2 } from "lucide-react";
import Link from "next/link";

interface CsvRow {
  topicName: string;
  form: string;
  type: string;
  difficulty: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  points: string;
  _valid?: boolean;
  _error?: string;
}

interface ImportResult {
  total: number;
  inserted: number;
  errors: number;
  details: { row: number; status: string; error?: string }[];
}

export default function ImportQuestionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function generateTemplate() {
    const headers = "topicName,form,type,difficulty,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,points";
    const sample = [
      "Nombor Nisbah,1,mcq,easy,\"Apakah nilai 1/2 + 1/4?\",A) 1/4,B) 3/4,C) 2/4,D) 1/2,B) 3/4,Samakan penyebut: 2/4+1/4=3/4,1",
      "Algebra,2,fill_blank,medium,Cari nilai x: 2x+6=14, , , , ,x=4,2x=14-6 jadi x=4,2",
      "Geometri,3,calculation,hard,\"Kira luas bulatan dengan jejari 7cm. (π=22/7)\", , , , ,154 cm^2,\"Luas=πr²=22/7×49\",3",
    ].join("\n");

    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_soalan.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): CsvRow[] {
    const lines: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "\n" && !inQuotes) {
        lines.push(current);
        current = "";
      } else if (char === "\r") {
        continue;
      } else {
        current += char;
      }
    }
    if (current.trim()) lines.push(current);

    if (lines.length < 2) return [];

    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const requiredHeaders = ["topicname", "form", "type", "difficulty", "questiontext", "correctanswer"];

    const hasRequired = requiredHeaders.every(h => header.includes(h));
    if (!hasRequired) return [];

    const parsed: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let cell = "";
      let inQ = false;
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const c = line[j];
        if (c === '"') {
          inQ = !inQ;
        } else if (c === "," && !inQ) {
          values.push(cell.trim());
          cell = "";
        } else {
          cell += c;
        }
      }
      values.push(cell.trim());

      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        if (idx < values.length) {
          row[h] = values[idx].replace(/^"|"$/g, "");
        } else {
          row[h] = "";
        }
      });

      parsed.push({
        topicName: row["topicname"] || "",
        form: row["form"] || "",
        type: row["type"] || "",
        difficulty: row["difficulty"] || "",
        questionText: row["questiontext"] || "",
        optionA: row["optiona"] || "",
        optionB: row["optionb"] || "",
        optionC: row["optionc"] || "",
        optionD: row["optiond"] || "",
        correctAnswer: row["correctanswer"] || "",
        explanation: row["explanation"] || "",
        points: row["points"] || "",
      });
    }
    return parsed;
  }

  function validateRows(parsedRows: CsvRow[]): CsvRow[] {
    return parsedRows.map(r => {
      if (!r.questionText.trim()) return { ...r, _valid: false, _error: "Teks soalan kosong" };
      if (!["mcq", "fill_blank", "calculation"].includes(r.type)) return { ...r, _valid: false, _error: `Jenis '${r.type}' tidak sah` };
      if (!["easy", "medium", "hard"].includes(r.difficulty)) return { ...r, _valid: false, _error: `Aras '${r.difficulty}' tidak sah` };
      if (!r.form || !["1", "2", "3"].includes(r.form)) return { ...r, _valid: false, _error: "Tingkatan mesti 1, 2 atau 3" };
      if (!r.topicName.trim()) return { ...r, _valid: false, _error: "Nama topik diperlukan" };
      if (!r.correctAnswer.trim()) return { ...r, _valid: false, _error: "Jawapan betul kosong" };
      if (r.type === "mcq") {
        if (!r.optionA.trim() || !r.optionB.trim() || !r.optionC.trim() || !r.optionD.trim()) {
          return { ...r, _valid: false, _error: "Semua pilihan A-D mesti diisi" };
        }
      }
      return { ...r, _valid: true, _error: undefined };
    });
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      alert("Sila pilih fail CSV");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert("Format CSV tidak sah. Pastikan header: topicName, form, type, difficulty, questionText, optionA, optionB, optionC, optionD, correctAnswer, explanation, points");
        return;
      }
      const validated = validateRows(parsed);
      setRows(validated);
      setResult(null);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    const validRows = rows.filter(r => r._valid);
    if (validRows.length === 0) return;

    setImporting(true);
    const questions = validRows.map(r => ({
      topicName: r.topicName,
      form: r.form,
      type: r.type,
      difficulty: r.difficulty,
      questionText: r.questionText,
      optionA: r.optionA,
      optionB: r.optionB,
      optionC: r.optionC,
      optionD: r.optionD,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation,
      points: r.points || "1",
    }));

    const res = await fetch("/api/questions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
    const data = await res.json();
    setResult(data);
    setImporting(false);
  }

  function handleReset() {
    setRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/parent/questions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Muat Naik Soalan (CSV)</h1>
          <p className="text-muted-foreground">Import soalan secara pukal menggunakan fail CSV</p>
        </div>
        <Button variant="outline" onClick={generateTemplate}>
          <Download className="h-4 w-4 mr-2" /> Muat Turun Template
        </Button>
      </div>

      {rows.length === 0 && !result && (
        <Card>
          <CardContent className="py-12">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lepaskan fail CSV di sini</h3>
              <p className="text-sm text-muted-foreground mb-4">atau klik untuk pilih fail</p>
              <p className="text-xs text-muted-foreground">Format: CSV dengan header yang betul (klik &quot;Muat Turun Template&quot; untuk contoh)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && !result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pratonton ({rows.length} soalan)</CardTitle>
                <CardDescription>
                  {rows.filter(r => r._valid).length} soalan sah · {rows.filter(r => !r._valid).length} ralat
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>Batal</Button>
                <Button onClick={handleImport} disabled={importing || rows.filter(r => r._valid).length === 0}>
                  {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {importing ? "Mengimport..." : `Import ${rows.filter(r => r._valid).length} Soalan`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left w-8">#</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Soalan</th>
                    <th className="p-2 text-left">Topik</th>
                    <th className="p-2 text-left">Jenis</th>
                    <th className="p-2 text-left">Aras</th>
                    <th className="p-2 text-left">Jawapan</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-t ${row._valid ? "" : "bg-red-50"}`}>
                      <td className="p-2 text-muted-foreground">{i + 2}</td>
                      <td className="p-2">
                        {row._valid ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">OK</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" title={row._error}>Ralat</Badge>
                        )}
                      </td>
                      <td className="p-2 max-w-xs truncate" title={row.questionText}>{row.questionText}</td>
                      <td className="p-2">T{row.form}: {row.topicName}</td>
                      <td className="p-2">{row.type === "mcq" ? "A/B/C/D" : row.type === "fill_blank" ? "Isi" : "Kira"}</td>
                      <td className="p-2">{row.difficulty}</td>
                      <td className="p-2 max-w-[120px] truncate" title={row.correctAnswer}>{row.correctAnswer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.filter(r => !r._valid).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">Ralat perlu dibetulkan:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {rows.filter(r => !r._valid).map((r, i) => (
                    <li key={i}>Baris {i + 2}: {r._error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Keputusan Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{result.inserted}</p>
                <p className="text-sm text-green-600">Berjaya Diimport</p>
              </div>
              <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
                <p className="text-sm text-red-600">Gagal</p>
              </div>
              <div className="flex-1 p-4 bg-muted border rounded-lg text-center">
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-sm text-muted-foreground">Jumlah</p>
              </div>
            </div>

            {result.details.filter(d => d.status === "error").length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-1">Butiran ralat:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {result.details.filter(d => d.status === "error").map((d, i) => (
                    <li key={i}>Baris {d.row}: {d.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>Import Lagi</Button>
              <Button onClick={() => router.push("/parent/questions")}>Kembali ke Senarai</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}