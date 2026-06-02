"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Coins, Save, Check } from "lucide-react";

interface PointConfig {
  easyPoints: number;
  mediumPoints: number;
  hardPoints: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<PointConfig>({ easyPoints: 1, mediumPoints: 2, hardPoints: 3 });
  const [saved, setSaved] = useState(false);
  const [pinForm, setPinForm] = useState({ currentPin: "", newPin: "", confirmPin: "" });
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setConfig);
  }, []);

  async function savePoints() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePin() {
    setPinError("");
    setPinSuccess(false);
    if (pinForm.newPin.length < 4) {
      setPinError("PIN baru mesti sekurang-kurangnya 4 aksara");
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError("PIN baru tidak sepadan");
      return;
    }
    const res = await fetch("/api/settings/parent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin: pinForm.currentPin, newPin: pinForm.newPin }),
    });
    if (!res.ok) {
      const data = await res.json();
      setPinError(data.error || "Ralat");
      return;
    }
    setPinSuccess(true);
    setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Tetapan</h1>
        <p className="text-muted-foreground">Urus konfigurasi sistem</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <CardTitle>Point Mengikut Aras</CardTitle>
          </div>
          <CardDescription>Tetapkan berapa point diberi untuk setiap aras soalan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="easy">Senang</Label>
              <Input id="easy" type="number" min="1" value={config.easyPoints}
                onChange={e => setConfig({ ...config, easyPoints: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label htmlFor="medium">Sederhana</Label>
              <Input id="medium" type="number" min="1" value={config.mediumPoints}
                onChange={e => setConfig({ ...config, mediumPoints: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label htmlFor="hard">Susah</Label>
              <Input id="hard" type="number" min="1" value={config.hardPoints}
                onChange={e => setConfig({ ...config, hardPoints: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <Button onClick={savePoints}>
            {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? "Disimpan!" : "Simpan"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Tukar PIN Ibu Bapa</CardTitle>
          </div>
          <CardDescription>Kemas kini PIN log masuk ibu bapa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cpin">PIN Semasa</Label>
            <Input id="cpin" type="text" value={pinForm.currentPin}
              onChange={e => setPinForm({ ...pinForm, currentPin: e.target.value })} placeholder="PIN semasa" />
          </div>
          <div>
            <Label htmlFor="npin">PIN Baru</Label>
            <Input id="npin" type="text" value={pinForm.newPin}
              onChange={e => setPinForm({ ...pinForm, newPin: e.target.value })} placeholder="PIN baru (min 4 aksara)" />
          </div>
          <div>
            <Label htmlFor="cfpin">Sahkan PIN Baru</Label>
            <Input id="cfpin" type="text" value={pinForm.confirmPin}
              onChange={e => setPinForm({ ...pinForm, confirmPin: e.target.value })} placeholder="Masukkan semula PIN baru" />
          </div>
          {pinError && <p className="text-sm text-red-500">{pinError}</p>}
          {pinSuccess && <p className="text-sm text-green-600">PIN berjaya ditukar!</p>}
          <Button onClick={changePin}>Tukar PIN</Button>
        </CardContent>
      </Card>
    </div>
  );
}