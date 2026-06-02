import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const childIdParam = searchParams.get("childId");
  const childId = childIdParam ? parseInt(childIdParam) : null;

  const where = childId ? { childId } : {};

  const attempts = await prisma.attempt.findMany({
    where,
    include: {
      child: { select: { id: true, name: true, avatarColor: true } },
      question: { include: { topic: { select: { id: true, name: true, form: true, icon: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const dailyPoints: { date: string; points: number }[] = [];
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  for (const date of last14) {
    const dayAttempts = attempts.filter(a => a.createdAt.toISOString().slice(0, 10) === date);
    dailyPoints.push({ date, points: dayAttempts.reduce((s, a) => s + a.pointsEarned, 0) });
  }

  const topicMap = new Map<string, { correct: number; total: number; icon: string }>();
  for (const a of attempts) {
    const key = a.question.topic.name;
    const existing = topicMap.get(key) || { correct: 0, total: 0, icon: a.question.topic.icon };
    existing.total++;
    if (a.isCorrect) existing.correct++;
    topicMap.set(key, existing);
  }
  const topicAccuracy = Array.from(topicMap.entries()).map(([name, d]) => ({
    name, icon: d.icon,
    accuracy: Math.round((d.correct / d.total) * 100),
    total: d.total,
  }));

  const childMap = new Map<number, { name: string; avatarColor: string; correct: number; total: number; points: number }>();
  for (const a of attempts) {
    const existing = childMap.get(a.child.id) || { name: a.child.name, avatarColor: a.child.avatarColor, correct: 0, total: 0, points: 0 };
    existing.total++;
    if (a.isCorrect) existing.correct++;
    existing.points += a.pointsEarned;
    childMap.set(a.child.id, existing);
  }
  const childPerformance = Array.from(childMap.entries()).map(([id, d]) => ({
    id, name: d.name, avatarColor: d.avatarColor,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    total: d.total, points: d.points,
  }));

  const recentActivity = attempts.slice(0, 50).map(a => ({
    id: a.id,
    childName: a.child.name,
    childAvatarColor: a.child.avatarColor,
    topicName: a.question.topic.name,
    topicIcon: a.question.topic.icon,
    isCorrect: a.isCorrect,
    pointsEarned: a.pointsEarned,
    date: a.createdAt.toISOString(),
  }));

  const selectedChild = childId
    ? await prisma.child.findUnique({ where: { id: childId }, select: { id: true, name: true, avatarColor: true } })
    : null;

  return NextResponse.json({
    totalAttempts,
    correctAttempts,
    overallAccuracy,
    dailyPoints,
    topicAccuracy,
    childPerformance,
    recentActivity,
    selectedChild,
  });
}