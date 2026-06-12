"use client";

import { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { MCQQuestion } from "@/components/quiz/MCQQuestion";
import { FillBlankQuestion } from "@/components/quiz/FillBlankQuestion";
import { CalculationQuestion } from "@/components/quiz/CalculationQuestion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ChevronRight, Trophy, Star } from "lucide-react";

interface QuizQuestion {
  id: number;
  type: string;
  difficulty: string;
  questionText: string;
  options: string[] | null;
  points: number;
}

interface QuizResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string | null;
  pointsEarned: number;
}

interface QuizSessionProps {
  questions: QuizQuestion[];
  topicName: string;
  onComplete: (score: { correct: number; total: number; points: number }) => void;
}

const DIFF_STYLES: Record<string, { label: string; color: string }> = {
  easy: { label: "Senang", color: "bg-green-100 text-green-700 border-green-200" },
  medium: { label: "Sederhana", color: "bg-amber-100 text-amber-700 border-amber-200" },
  hard: { label: "Susah", color: "bg-red-100 text-red-700 border-red-200" },
};

export function QuizSession({ questions, topicName, onComplete }: QuizSessionProps) {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const diff = DIFF_STYLES[current.difficulty] || DIFF_STYLES.easy;

  function handleAnswer(answer: string) {
    setSubmitting(true);
    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, answer }),
    })
      .then(r => r.json())
      .then(data => {
        setResult(data);
        setResults(prev => [...prev, data]);
      })
      .finally(() => setSubmitting(false));
  }

  function handleNext() {
    if (isLast) {
      const score = {
        correct: results.filter(r => r.correct).length,
        total: questions.length,
        points: results.reduce((sum, r) => sum + r.pointsEarned, 0),
      };
      onComplete(score);
    } else {
      setIndex(prev => prev + 1);
      setResult(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading">{topicName}</h2>
          <p className="text-sm text-muted-foreground">
            Soalan {index + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${diff.color} border text-sm font-medium px-3 py-1`}>
            {diff.label}
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Star className="h-3 w-3 mr-1 text-yellow-500" /> {current.points} pt
          </Badge>
        </div>
      </div>

      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="border-2 border-indigo-100 rounded-2xl shadow-md overflow-hidden">
        <CardContent className="pt-6">
          {current.type === "mcq" && current.options && (
            <MCQQuestion
              questionText={current.questionText}
              options={current.options}
              onAnswer={handleAnswer}
              disabled={!!result || submitting}
            />
          )}
          {current.type === "fill_blank" && (
            <FillBlankQuestion
              questionText={current.questionText}
              onAnswer={handleAnswer}
              disabled={!!result || submitting}
            />
          )}
          {current.type === "calculation" && (
            <CalculationQuestion
              questionText={current.questionText}
              onAnswer={handleAnswer}
              disabled={!!result || submitting}
            />
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 rounded-2xl slide-up ${
          result.correct ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50" : "border-red-300 bg-gradient-to-r from-red-50 to-rose-50"
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              {result.correct ? (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg bounce-in">
                  <Check className="h-7 w-7 text-white" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg bounce-in">
                  <X className="h-7 w-7 text-white" />
                </div>
              )}
              <div>
                <p className="text-xl font-heading font-semibold">
                  {result.correct ? "Betul! 🎉" : "Salah 😅"}
                </p>
                {result.correct ? (
                  <p className="text-green-700 font-heading text-lg">+{result.pointsEarned} point</p>
                ) : (
                  <p className="text-red-700">
                    Jawapan betul: <MathRenderer text={result.correctAnswer} />
                  </p>
                )}
              </div>
            </div>
            {result.explanation && (
              <div className="p-4 bg-white/80 rounded-xl border border-gray-200 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Penjelasan:</p>
                <p className="text-sm">{result.explanation}</p>
              </div>
            )}
            <Button
              onClick={handleNext}
              className="rounded-2xl h-12 px-8 text-base font-heading"
            >
              {isLast ? (
                <><Trophy className="h-5 w-5 mr-2" /> Lihat Keputusan</>
              ) : (
                <><ChevronRight className="h-5 w-5 mr-2" /> Soalan Seterusnya</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
