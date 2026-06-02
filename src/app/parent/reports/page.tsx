"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, CheckCircle, Star, Users } from "lucide-react";

interface Child {
  id: number; name: string; avatarColor: string;
}

interface StatsData {
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  dailyPoints: { date: string; points: number }[];
  topicAccuracy: { name: string; icon: string; accuracy: number; total: number }[];
  childPerformance: { id: number; name: string; avatarColor: string; accuracy: number; total: number; points: number }[];
  recentActivity: { id: number; childName: string; childAvatarColor: string; topicName: string; topicIcon: string; isCorrect: boolean; pointsEarned: number; date: string }[];
  selectedChild: { id: number; name: string; avatarColor: string } | null;
}

const COLORS = ["#3B82F6", "#22C55E", "#F97316", "#A855F7", "#EF4444", "#EC4899", "#14B8A6", "#EAB308"];

export default function ParentReportsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/children").then(r => r.json()).then(setChildren).catch(() => {});
  }, []);

  useEffect(() => {
    const url = selectedChildId === "all" ? "/api/stats" : `/api/stats?childId=${selectedChildId}`;
    fetch(url).then(r => r.json()).then(setData).catch(() => {});
  }, [selectedChildId]);

  if (!data) {
    return (
      <div className="space-y-4">
        <Card><CardContent className="py-12 text-center text-muted-foreground">Memuatkan laporan...</CardContent></Card>
      </div>
    );
  }

  const selectedChild = children.find(c => String(c.id) === selectedChildId);
  const days = data.dailyPoints.map(d => ({
    date: new Date(d.date).toLocaleDateString("ms-MY", { day: "numeric", month: "short" }),
    points: d.points,
  }));
  const pieData = data.topicAccuracy.map(t => ({ name: `${t.icon} ${t.name}`, value: t.total }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
          <p className="text-muted-foreground">
            {selectedChild ? `Prestasi ${selectedChild.name}` : "Prestasi semua anak"}
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select value={selectedChildId} onValueChange={(v) => setSelectedChildId(v ?? "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih anak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Anak</SelectItem>
              {children.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getColor(c.avatarColor) }} />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-blue-700">{data.totalAttempts}</p>
            <p className="text-xs text-blue-600">Jumlah Soalan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-700">{data.overallAccuracy}%</p>
            <p className="text-xs text-green-600">Ketepatan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold text-purple-700">{data.correctAttempts}</p>
            <p className="text-xs text-purple-600">Betul</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Star className="h-6 w-6 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-700">{data.totalAttempts - data.correctAttempts}</p>
            <p className="text-xs text-amber-600">Salah</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="font-heading">Point Harian</CardTitle></CardHeader>
          <CardContent>
            {days.some(d => d.points > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">Tiada data point</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading">Taburan Topik</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">Tiada data topik</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="font-heading">Ketepatan ikut Topik</CardTitle></CardHeader>
          <CardContent>
            {data.topicAccuracy.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.topicAccuracy} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="accuracy" fill="#22C55E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">Tiada data topik</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading">Prestasi Anak</CardTitle></CardHeader>
          <CardContent>
            {data.childPerformance.length > 0 ? (
              <div className="space-y-3">
                {data.childPerformance.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getColor(c.avatarColor) }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.total} soalan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.accuracy}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{c.accuracy}%</span>
                      </div>
                      <p className="text-xs text-yellow-600">{c.points} point</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">Tiada data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Aktiviti Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anak</TableHead>
                    <TableHead>Topik</TableHead>
                    <TableHead>Keputusan</TableHead>
                    <TableHead>Point</TableHead>
                    <TableHead>Tarikh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentActivity.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.childName}</TableCell>
                      <TableCell>{a.topicIcon} {a.topicName}</TableCell>
                      <TableCell>
                        {a.isCorrect
                          ? <Badge className="bg-green-100 text-green-700">Betul</Badge>
                          : <Badge className="bg-red-100 text-red-700">Salah</Badge>
                        }
                      </TableCell>
                      <TableCell>{a.isCorrect ? `+${a.pointsEarned}` : "0"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("ms-MY")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              Tiada aktiviti
            </div>
          )}
        </CardContent>
      </Card>
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