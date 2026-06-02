"use client";

import { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";
import { MCQQuestion } from "@/components/quiz/MCQQuestion";
import { FillBlankQuestion } from "@/components/quiz/FillBlankQuestion";
import { CalculationQuestion } from "@/components/quiz/CalculationQuestion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ChevronRight, Trophy } from "lucide-react";

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

export function QuizSession({ questions, topicName, onComplete }: QuizSessionProps) {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function diffLabel(d: string) {
    if (d === "easy") return "Senang";
    if (d === "medium") return "Sederhana";
    return "Susah";
  }

  async function handleAnswer(answer: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: current.id, answer }),
      });
      const data = await res.json();
      setResult(data);
      setResults(prev => [...prev, data]);
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{topicName}</h2>
          <p className="text-sm text-muted-foreground">
            {index + 1} / {questions.length} soalan
          </p>
        </div>
        <Badge variant="secondary">{diffLabel(current.difficulty)} · {current.points} pt</Badge>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <Card>
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
        <Card className={result.correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              {result.correct ? (
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {result.correct ? "Betul!" : "Salah"}
                </p>
                {result.correct ? (
                  <p className="text-sm text-green-700">+{result.pointsEarned} point</p>
                ) : (
                  <p className="text-sm text-red-700">
                    Jawapan betul: <MathRenderer text={result.correctAnswer} />
                  </p>
                )}
              </div>
            </div>
            {result.explanation && (
              <div className="p-3 bg-background rounded-md border">
                <p className="text-xs text-muted-foreground mb-1">Penjelasan:</p>
                <p className="text-sm">{result.explanation}</p>
              </div>
            )}
            <Button className="mt-4" onClick={handleNext}>
              {isLast ? (
                <><Trophy className="h-4 w-4 mr-2" /> Lihat Keputusan</>
              ) : (
                <><ChevronRight className="h-4 w-4 mr-2" /> Soalan Seterusnya</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}