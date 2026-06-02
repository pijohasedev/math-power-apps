"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target, TrendingUp } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold">Point Saya</h1>
        <p className="text-muted-foreground">Urus point dan lihat sejarah</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6 text-center">
            <Star className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold text-yellow-700">{points?.currentPoints ?? 0}</p>
            <p className="text-xs text-yellow-600">Point</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-700">{points?.totalPointsEarned ?? 0}</p>
            <p className="text-xs text-blue-600">Jumlah</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-700">{accuracy}%</p>
            <p className="text-xs text-green-600">Ketepatan</p>
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Transaksi</h3>
            <p className="text-muted-foreground">Jawab soalan kuiz untuk mula mengumpul point!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sejarah Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{tx.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString("ms-MY")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${tx.points > 0 ? "text-green-600" : "text-orange-600"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}pt
                    </span>
                    {tx.type === "earn" && (
                      <Badge variant="outline" className={tx.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                        {tx.status === "success" ? "Betul" : "Salah"}
                      </Badge>
                    )}
                    {tx.type === "spend" && (
                      <Badge variant="outline" className={
                        tx.status === "approved" ? "bg-green-50 text-green-700" :
                        tx.status === "rejected" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
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