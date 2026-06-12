"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target, TrendingUp, Sparkles } from "lucide-react";

interface PointsData {
  currentPoints: number;
  totalPointsEarned: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface AttemptItem {
  id: number;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
  question: { topic: { name: string; icon: string } };
}

interface RedemptionItem {
  id: number;
  points: number;
  status: string;
  createdAt: string;
  reward: { name: string; icon: string };
}

export default function ChildPointsPage() {
  const [points, setPoints] = useState<PointsData | null>(null);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);

  useEffect(() => {
    fetch("/api/child/points").then(r => r.json()).then(setPoints);
    fetch("/api/quiz?history=1").then(r => r.json()).then(d => setAttempts(d.attempts || [])).catch(() => {});
    fetch("/api/redemptions").then(r => r.json()).then(setRedemptions);
  }, []);

  const accuracy = points && points.totalQuestions > 0
    ? Math.round((points.correctAnswers / points.totalQuestions) * 100) : 0;

  const transactions = [
    ...attempts.map(a => ({
      id: `a-${a.id}`,
      type: "earn" as const,
      label: a.question?.topic?.name || "Kuiz",
      icon: a.question?.topic?.icon || "📝",
      points: a.pointsEarned,
      status: a.isCorrect ? "success" : "fail",
      date: a.createdAt,
    })),
    ...redemptions.map(r => ({
      id: `r-${r.id}`,
      type: "spend" as const,
      label: r.reward?.name || "Redeem",
      icon: r.reward?.icon || "🎁",
      points: -r.points,
      status: r.status,
      date: r.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
          <Star className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading">Point Saya</h1>
          <p className="text-muted-foreground">Urus point dan lihat sejarah</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500" />
          <CardContent className="pt-4 text-center">
            <Star className="h-6 w-6 mx-auto text-yellow-500 mb-1 sparkle" />
            <p className="text-2xl font-heading font-bold text-yellow-700">{points?.currentPoints ?? 0}</p>
            <p className="text-xs font-medium text-yellow-600">Point</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <CardContent className="pt-4 text-center">
            <Trophy className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-heading font-bold text-blue-700">{points?.totalPointsEarned ?? 0}</p>
            <p className="text-xs font-medium text-blue-600">Jumlah</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardContent className="pt-4 text-center">
            <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-heading font-bold text-green-700">{accuracy}%</p>
            <p className="text-xs font-medium text-green-600">Ketepatan</p>
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Tiada Transaksi</h3>
            <p className="text-muted-foreground">Jawab soalan kuiz untuk mula mengumpul point!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Sejarah Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString("ms-MY")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-bold text-sm ${tx.points > 0 ? "text-green-600" : "text-orange-600"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}pt
                    </span>
                    {tx.type === "earn" && (
                      <Badge variant="outline" className={tx.status === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {tx.status === "success" ? "Betul" : "Salah"}
                      </Badge>
                    )}
                    {tx.type === "spend" && (
                      <Badge variant="outline" className={
                        tx.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                        tx.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }>
                        {tx.status === "approved" ? "Lulus" : tx.status === "rejected" ? "Ditolak" : "Pending"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
