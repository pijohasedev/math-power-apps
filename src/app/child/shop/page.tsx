"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  isActive: boolean;
}

interface Redemption {
  id: number;
  rewardId: number;
  points: number;
  status: string;
  createdAt: string;
  reward: { id: number; name: string; icon: string; pointsRequired: number };
}

export default function ChildShopPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [redeeming, setRedeeming] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/rewards").then(r => r.json()).then(setRewards);
    fetch("/api/redemptions").then(r => r.json()).then(setRedemptions);
    fetch("/api/child/points").then(r => r.json()).then(d => setMyPoints(d.currentPoints)).catch(() => {});
  }, []);

  async function handleRedeem(rewardId: number) {
    setRedeeming(rewardId);
    setMessage(null);
    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal redeem" });
      } else {
        setMessage({ type: "success", text: "Permintaan dihantar! Parent akan luluskan." });
        setMyPoints(prev => prev - data.points);
        setRedemptions(prev => [data, ...prev]);
      }
    } catch {
      setMessage({ type: "error", text: "Ralat sambungan" });
    }
    setRedeeming(null);
  }

  function statusBadge(status: string) {
    if (status === "approved") return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Diluluskan</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl mb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-sm text-yellow-700">Point Anda</p>
            <p className="text-3xl font-bold text-yellow-700">{myPoints}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.filter(r => r.isActive).map(reward => {
          const canAfford = myPoints >= reward.pointsRequired;
          return (
            <Card key={reward.id} className={`relative overflow-hidden border-2 transition-all hover:shadow-md ${canAfford ? "hover:border-primary/50" : "opacity-60"}`}>
              <CardContent className="pt-6 text-center">
                <span className="text-4xl block mb-3">{reward.icon}</span>
                <h3 className="font-bold text-lg">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-primary">{reward.pointsRequired}</span>
                  <span className="text-muted-foreground text-sm">point</span>
                </div>
                <Button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canAfford || redeeming === reward.id}
                  className="w-full rounded-xl"
                  variant={canAfford ? "default" : "outline"}
                >
                  {redeeming === reward.id ? (
                    "Memproses..."
                  ) : canAfford ? (
                    <><ShoppingBag className="h-4 w-4 mr-2" /> Redeem</>
                  ) : (
                    `Perlu ${reward.pointsRequired - myPoints} lagi point`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.filter(r => r.isActive).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Hadiah</h3>
            <p className="text-muted-foreground">Minta ibu bapa tambah hadiah di panel parent!</p>
          </CardContent>
        </Card>
      )}

      {redemptions.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sejarah Redeem</CardTitle>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2">
                {redemptions.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.reward.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{r.reward.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("ms-MY")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">-{r.points}pt</span>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}