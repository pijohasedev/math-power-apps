"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

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

const REWARD_GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-green-400 to-teal-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
];

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
    if (status === "approved") return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Diluluskan</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
  }

  const activeRewards = rewards.filter(r => r.isActive);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading">Kedai Hadiah</h1>
          <p className="text-muted-foreground">Redeem point untuk dapat hadiah!</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
          <Star className="h-8 w-8 text-yellow-500 sparkle" />
          <div>
            <p className="text-sm text-yellow-700">Point Anda</p>
            <p className="text-3xl font-heading font-bold text-yellow-700">{myPoints}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-medium slide-up ${message.type === "success" ? "bg-green-100 text-green-800 border-2 border-green-200" : "bg-red-100 text-red-800 border-2 border-red-200"}`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRewards.map((reward, i) => {
          const canAfford = myPoints >= reward.pointsRequired;
          const gradient = REWARD_GRADIENTS[i % REWARD_GRADIENTS.length];
          return (
            <Card key={reward.id} className={`relative overflow-hidden border-2 transition-all duration-200 rounded-2xl ${
              canAfford ? "hover:shadow-lg hover:-translate-y-1" : "opacity-60"
            }`}>
              <div className={`h-2 bg-gradient-to-r ${gradient}`} />
              <CardContent className="pt-5 text-center">
                <span className="text-4xl block mb-2">{reward.icon}</span>
                <h3 className="font-heading font-bold text-lg">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-heading font-bold text-xl text-primary">{reward.pointsRequired}</span>
                  <span className="text-muted-foreground text-sm">point</span>
                </div>
                <Button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canAfford || redeeming === reward.id}
                  className="w-full rounded-2xl h-12 font-heading text-base"
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

      {activeRewards.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Tiada Hadiah</h3>
            <p className="text-muted-foreground">Minta ibu bapa tambah hadiah di panel parent!</p>
          </CardContent>
        </Card>
      )}

      {redemptions.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader className="cursor-pointer" onClick={() => setShowHistory(!showHistory)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Sejarah Redeem
              </CardTitle>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2">
                {redemptions.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.reward.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{r.reward.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("ms-MY")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600">-{r.points}pt</span>
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
