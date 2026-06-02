"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { CheckCircle, XCircle, TrendingUp, Target } from "lucide-react";

interface StatsData {
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  dailyPoints: { date: string; points: number }[];
  topicAccuracy: { name: string; icon: string; accuracy: number; total: number }[];
  childPerformance: { id: number; name: string; avatarColor: string; accuracy: number; total: number; points: number }[];
  recentActivity: { id: number; childName: string; childAvatarColor: string; topicName: string; topicIcon: string; isCorrect: boolean; pointsEarned: number; date: string }[];
}

export function ParentDashboardCharts() {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <Card key={i}><CardContent className="py-12 text-center text-muted-foreground">Memuatkan...</CardContent></Card>
        ))}
      </div>
    );
  }

  const days = data.dailyPoints.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString("ms-MY", { day: "numeric", month: "short" }) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-700">{data.totalAttempts}</p>
            <p className="text-xs text-blue-600">Jumlah Soalan Dijawab</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-700">{data.overallAccuracy}%</p>
            <p className="text-xs text-green-600">Ketepatan Keseluruhan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold text-purple-700">{data.correctAttempts}</p>
            <p className="text-xs text-purple-600">Betul</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-heading">Point Harian (14 hari)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="oklch(0.55 0.22 260)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-heading">Ketepatan ikut Topik</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topicAccuracy} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="accuracy" fill="oklch(0.55 0.22 260)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.childPerformance.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-heading">Prestasi Anak</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.childPerformance.map(c => (
                <Card key={c.id} className="border-2 border-primary/10">
                  <CardContent className="pt-4 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
                      style={{ backgroundColor: getColor(c.avatarColor) }}>
                      {c.name[0]}
                    </div>
                    <h4 className="font-semibold text-sm">{c.name}</h4>
                    <div className="flex justify-center gap-3 mt-2 text-xs">
                      <span className="text-green-600">{c.accuracy}% betul</span>
                      <span className="text-muted-foreground">{c.total} soalan</span>
                      <span className="text-yellow-600">{c.points} point</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.recentActivity.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-heading">Aktiviti Terkini</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.recentActivity.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getColor(a.childAvatarColor) }}>
                      {a.childName[0]}
                    </div>
                    <span className="font-medium">{a.childName}</span>
                    <span className="text-muted-foreground">{a.topicIcon} {a.topicName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.isCorrect ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Betul +{a.pointsEarned}pt</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-xs">Salah</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("ms-MY")}</span>
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

function getColor(color: string): string {
  const colors: Record<string, string> = {
    blue: "#3B82F6", green: "#22C55E", red: "#EF4444",
    purple: "#A855F7", orange: "#F97316", pink: "#EC4899",
  };
  return colors[color] || "#3B82F6";
}