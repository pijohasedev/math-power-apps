import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "child") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topicId");
  const history = searchParams.get("history");

  if (history === "1") {
    const attempts = await prisma.attempt.findMany({
      where: { childId: session.id },
      include: {
        question: {
          select: {
            id: true,
            topic: { select: { name: true, icon: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ attempts });
  }

  if (!topicId) {
    return NextResponse.json({ error: "topicId diperlukan" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({
    where: { id: parseInt(topicId) },
  });
  if (!topic) {
    return NextResponse.json({ error: "Topik tidak dijumpai" }, { status: 404 });
  }

  const questions = await prisma.question.findMany({
    where: { topicId: parseInt(topicId) },
    orderBy: { id: "asc" },
  });

  const shuffled = questions.sort(() => Math.random() - 0.5);

  return NextResponse.json({
    topic,
    questions: shuffled.map(q => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.options ? JSON.parse(q.options) : null,
      points: q.points,
    })),
  });
}