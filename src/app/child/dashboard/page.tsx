import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, BookOpen, Award, Target } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-primary">Hai, {child.name}! 👋</h1>
        <p className="text-muted-foreground">Teruskan belajar dan kumpul point!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="child-gradient-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-heading text-muted-foreground">Point Semasa</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-primary">{child.currentPoints}</div>
          </CardContent>
        </Card>
        <Card className="child-gradient-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-heading text-muted-foreground">Jawapan Betul</CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-green-600">{accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {child.correctAnswers} / {child.totalQuestions}
            </p>
          </CardContent>
        </Card>
        <Card className="child-gradient-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-heading text-muted-foreground">Topik Boleh Belajar</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-blue-600">{topicCount}</div>
          </CardContent>
        </Card>
        <Card className="child-gradient-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-heading text-muted-foreground">Hadiah Boleh Redeem</CardTitle>
            <Award className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-purple-600">{availableRewards}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/child/quiz">
          <Card className="child-card cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="p-3 rounded-2xl bg-blue-100">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-heading font-semibold">Mula Kuiz</h3>
              <p className="text-sm text-muted-foreground text-center">
                Pilih topik dan jawab soalan untuk dapat point!
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/child/shop">
          <Card className="child-card cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="p-3 rounded-2xl bg-purple-100">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-heading font-semibold">Kedai Hadiah</h3>
              <p className="text-sm text-muted-foreground text-center">
                Redeem point untuk dapat hadiah!
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Aktiviti Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{attempt.question.topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.createdAt).toLocaleDateString("ms-MY")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {attempt.isCorrect ? (
                      <>
                        <span className="text-green-600 font-medium">Betul</span>
                        <span className="text-xs text-muted-foreground">+{attempt.pointsEarned} pt</span>
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