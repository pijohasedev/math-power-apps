import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, BookOpen, Award, Target, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ChildDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mathpower-session");
  const childId = parseInt(session?.value.split(":")[1] || "0");

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Profil tidak dijumpai.</p>
      </div>
    );
  }

  const recentAttempts = await prisma.attempt.findMany({
    where: { childId },
    include: { question: { include: { topic: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const availableRewards = await prisma.reward.count({
    where: { isActive: true, pointsRequired: { lte: child.currentPoints } },
  });

  const accuracy = child.totalQuestions > 0
    ? Math.round((child.correctAnswers / child.totalQuestions) * 100)
    : 0;

  const topicCount = await prisma.topic.count();

  const greetings = [
    "Semangat belajar! 🔥",
    "Teruskan usaha! 💪",
    "Hebat hari ini! ⭐",
    "Jom belajar! 🚀",
    "Power sangat! 💯",
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-indigo-600">
            Hai, {child.name}! <span className="inline-block wiggle" style={{ animationDelay: "0.5s" }}>👋</span>
          </h1>
          <p className="text-muted-foreground">{greeting}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl">
          <Star className="h-5 w-5 text-yellow-500 sparkle" />
          <span className="font-heading text-lg font-bold text-yellow-700">{child.currentPoints}</span>
          <span className="text-sm text-yellow-600">point</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="child-gradient-card from-blue-50 to-indigo-100 border-blue-200 border-none overflow-hidden relative">
          <div className="absolute top-2 right-2 text-blue-200 text-4xl opacity-50 float-anim">⚡</div>
          <CardContent className="pt-5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-blue-200">
                <Zap className="h-4 w-4 text-blue-700" />
              </div>
              <p className="text-xs font-medium text-blue-600">Point Semasa</p>
            </div>
            <p className="text-3xl font-heading font-bold text-blue-700">{child.currentPoints}</p>
          </CardContent>
        </Card>
        <Card className="child-gradient-card from-green-50 to-emerald-100 border-green-200 border-none overflow-hidden relative">
          <div className="absolute top-2 right-2 text-green-200 text-4xl opacity-50 float-anim" style={{ animationDelay: "0.5s" }}>🎯</div>
          <CardContent className="pt-5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-green-200">
                <Target className="h-4 w-4 text-green-700" />
              </div>
              <p className="text-xs font-medium text-green-600">Ketepatan</p>
            </div>
            <p className="text-3xl font-heading font-bold text-green-700">{accuracy}%</p>
            <p className="text-xs text-green-500">{child.correctAnswers}/{child.totalQuestions}</p>
          </CardContent>
        </Card>
        <Card className="child-gradient-card from-purple-50 to-pink-100 border-purple-200 border-none overflow-hidden relative">
          <div className="absolute top-2 right-2 text-purple-200 text-4xl opacity-50 float-anim" style={{ animationDelay: "1s" }}>📚</div>
          <CardContent className="pt-5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-200">
                <BookOpen className="h-4 w-4 text-purple-700" />
              </div>
              <p className="text-xs font-medium text-purple-600">Topik</p>
            </div>
            <p className="text-3xl font-heading font-bold text-purple-700">{topicCount}</p>
          </CardContent>
        </Card>
        <Card className="child-gradient-card from-yellow-50 to-orange-100 border-yellow-200 border-none overflow-hidden relative">
          <div className="absolute top-2 right-2 text-yellow-200 text-4xl opacity-50 float-anim" style={{ animationDelay: "1.5s" }}>🎁</div>
          <CardContent className="pt-5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-yellow-200">
                <Award className="h-4 w-4 text-yellow-700" />
              </div>
              <p className="text-xs font-medium text-yellow-600">Hadiah</p>
            </div>
            <p className="text-3xl font-heading font-bold text-yellow-700">{availableRewards}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/child/quiz">
          <Card className="group cursor-pointer h-full border-2 border-transparent hover:border-purple-300 transition-all duration-200 overflow-hidden">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold">Mula Kuiz</h3>
                <p className="text-sm text-muted-foreground">Pilih topik dan jawab soalan untuk dapat point!</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/child/shop">
          <Card className="group cursor-pointer h-full border-2 border-transparent hover:border-yellow-300 transition-all duration-200 overflow-hidden">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold">Kedai Hadiah</h3>
                <p className="text-sm text-muted-foreground">Redeem point untuk dapat hadiah!</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Aktiviti Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAttempts.map((attempt, i) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{attempt.question.topic.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{attempt.question.topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.createdAt).toLocaleDateString("ms-MY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempt.isCorrect ? (
                      <>
                        <span className="text-green-600 font-semibold">Betul</span>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">+{attempt.pointsEarned}</span>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">Salah</span>
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
