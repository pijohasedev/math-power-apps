"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Check, X } from "lucide-react";

interface RedemptionItem {
  id: number;
  points: number;
  status: string;
  createdAt: string;
  child: { id: number; name: string; avatarColor: string };
  reward: { id: number; name: string; icon: string; pointsRequired: number };
}

export default function ParentRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    fetch("/api/redemptions").then(r => r.json()).then(setRedemptions);
  }, []);

  async function handleAction(id: number, status: "approved" | "rejected") {
    const res = await fetch(`/api/redemptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  }

  const pending = redemptions.filter(r => r.status === "pending");
  const history = redemptions.filter(r => r.status !== "pending");

  function statusBadge(status: string) {
    if (status === "approved") return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Diluluskan</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelulusan Redeem</h1>
        <p className="text-muted-foreground">Luluskan atau tolak permintaan redeem point anak-anak</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Menunggu {pending.length > 0 && `(${pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="history">Sejarah</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tiada Permintaan</h3>
                <p className="text-muted-foreground">Semua permintaan sudah diproses</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pending.map(r => (
                <Card key={r.id} className="border-yellow-200 bg-yellow-50/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white`}
                          style={{ backgroundColor: getColor(r.child.avatarColor) }}>
                          {r.child.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{r.child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Mahu redeem <strong>{r.reward.icon} {r.reward.name}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString("ms-MY")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-base px-3 py-1">{r.points} point</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleAction(r.id, "approved")} className="flex-1">
                        <Check className="h-4 w-4 mr-2" /> Luluskan
                      </Button>
                      <Button onClick={() => handleAction(r.id, "rejected")} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" /> Tolak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tiada Sejarah</h3>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anak</TableHead>
                    <TableHead>Hadiah</TableHead>
                    <TableHead>Point</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tarikh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.child.name}</TableCell>
                      <TableCell>{r.reward.icon} {r.reward.name}</TableCell>
                      <TableCell>{r.points}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("ms-MY")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
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