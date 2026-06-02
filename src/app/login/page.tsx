"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PinInput } from "@/components/shared/PinInput";
import { Calculator, User, Baby } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"parent" | "child" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(enteredPin: string) {
    if (!role) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, pin: enteredPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal log masuk. Sila cuba lagi.");
        return;
      }

      router.push(`/${data.role}/dashboard`);
      router.refresh();
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">➕</div>
        <div className="absolute top-20 right-20 text-5xl">✖️</div>
        <div className="absolute bottom-20 left-16 text-5xl">➗</div>
        <div className="absolute bottom-10 right-10 text-6xl">➖</div>
        <div className="absolute top-1/3 left-1/4 text-4xl">π</div>
        <div className="absolute top-1/2 right-1/3 text-4xl">√</div>
        <div className="absolute top-3/4 left-1/2 text-4xl">=</div>
      </div>
      {!role ? (
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg">
              <Calculator className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-heading">MathPower</CardTitle>
            <CardDescription className="text-base">Belajar matematik, kumpul point, dapat hadiah!</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground mb-1">Saya adalah...</p>
            <Button
              variant="outline"
              size="lg"
              className="h-18 flex-col gap-1 rounded-2xl border-2 hover:border-primary/50 transition-all"
              onClick={() => setRole("parent")}
            >
              <User className="h-5 w-5" />
              <span className="font-heading text-base">Ibu Bapa</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-18 flex-col gap-1 rounded-2xl border-2 hover:border-primary/50 transition-all"
              onClick={() => setRole("child")}
            >
              <Baby className="h-5 w-5" />
              <span className="font-heading text-base">Anak / Pelajar</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-lg">
              {role === "parent" ? <User className="h-8 w-8" /> : <Baby className="h-8 w-8" />}
            </div>
            <CardTitle className="text-2xl font-heading">
              {role === "parent" ? "Ibu Bapa" : "Pelajar"}
            </CardTitle>
            <CardDescription className="text-base">
              {role === "parent"
                ? "Masukkan PIN ibu bapa untuk mengurus sistem"
                : "Masukkan PIN anda untuk mula belajar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <PinInput
              length={4}
              onComplete={handleLogin}
              disabled={loading}
              error={error}
            />
            <div className="flex gap-2 w-full">
              <Button
                variant="ghost"
                className="flex-1 rounded-xl"
                onClick={() => { setRole(null); setError(""); }}
                disabled={loading}
              >
                Kembali
              </Button>
            </div>
            {loading && (
              <p className="text-sm text-muted-foreground animate-pulse">Sedang log masuk...</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}