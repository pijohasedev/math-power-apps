import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topicId");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");

  const questions = await prisma.question.findMany({
    where: {
      ...(topicId ? { topicId: parseInt(topicId) } : {}),
      ...(type ? { type } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(search ? { questionText: { contains: search } } : {}),
    },
    include: { topic: { select: { id: true, name: true, form: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topicId,
      type,
      difficulty,
      questionText,
      options,
      correctAnswer,
      explanation,
      points,
    } = body;

    if (!topicId || !type || !difficulty || !questionText || !correctAnswer) {
      return NextResponse.json({ error: "Sila isi semua ruangan wajib" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        topicId: parseInt(topicId),
        type,
        difficulty,
        questionText,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        explanation: explanation || null,
        points: points ? parseInt(points) : 1,
      },
      include: { topic: true },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}