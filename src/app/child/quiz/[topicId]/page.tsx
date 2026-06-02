"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { QuizSession } from "@/components/quiz/QuizSession";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface QuizData {
  topic: { id: number; name: string; form: number; icon: string };
  questions: {
    id: number;
    type: string;
    difficulty: string;
    questionText: string;
    options: string[] | null;
    points: number;
  }[];
}

interface QuizComplete {
  correct: number;
  total: number;
  points: number;
}

export default function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState<QuizComplete | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz?topicId=${topicId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuizData(data);
        }
      })
      .catch(() => setError("Gagal memuatkan soalan"))
      .finally(() => setLoading(false));
  }, [topicId]);

  function handleComplete(score: QuizComplete) {
    setComplete(score);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuatkan soalan...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">{error || "Ralat memuatkan soalan"}</p>
        <Link href="/child/quiz">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button>
        </Link>
      </div>
    );
  }

  if (complete) {
    const percentage = Math.round((complete.correct / complete.total) * 100);
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="text-center border-primary/30">
          <CardContent className="py-10">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <CardTitle className="text-2xl mb-2">Kuiz Selesai!</CardTitle>
            <CardDescription className="mb-6">
              {quizData.topic.icon} {quizData.topic.name} · Tingkatan {quizData.topic.form}
            </CardDescription>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{complete.correct}</p>
                <p className="text-xs text-green-600">Betul</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{complete.total - complete.correct}</p>
                <p className="text-xs text-red-600">Salah</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{percentage}%</p>
                <p className="text-xs text-blue-600">Skor</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{complete.points} point diperoleh!</span>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setComplete(null); setStarted(false); setLoading(true); window.location.reload(); }}>
                <RotateCcw className="h-4 w-4 mr-2" /> Cuba Lagi
              </Button>
              <Link href="/child/quiz">
                <Button variant="outline">Pilih Topik Lain</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!started) {
    const totalQuestions = quizData.questions.length;
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center">
          <CardContent className="py-10">
            <span className="text-5xl mb-4 block">{quizData.topic.icon}</span>
            <CardTitle className="text-2xl mb-2">{quizData.topic.name}</CardTitle>
            <CardDescription className="mb-6">
              Tingkatan {quizData.topic.form} · {totalQuestions} soalan
            </CardDescription>
            <div className="space-y-2 mb-6 text-sm text-muted-foreground text-left max-w-xs mx-auto">
              <p>✅ Jawab semua soalan</p>
              <p>⭐ Kumpul point untuk setiap jawapan betul</p>
              <p>🎮 Redeem point untuk dapat hadiah</p>
            </div>
            <Button size="lg" onClick={() => setStarted(true)} disabled={totalQuestions === 0}>
              {totalQuestions === 0 ? "Tiada Soalan" : "Mula Kuiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <QuizSession
        questions={quizData.questions}
        topicName={`${quizData.topic.icon} ${quizData.topic.name}`}
        onComplete={handleComplete}
      />
    </div>
  );
}