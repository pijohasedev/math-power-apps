import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    include: { topic: true },
  });
  if (!question) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 });
  return NextResponse.json(question);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { topicId, type, difficulty, questionText, options, correctAnswer, explanation, points } = body;

    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        topicId: topicId ? parseInt(topicId) : undefined,
        type,
        difficulty,
        questionText,
        options: options !== undefined ? JSON.stringify(options) : undefined,
        correctAnswer,
        explanation,
        points: points ? parseInt(points) : undefined,
      },
      include: { topic: true },
    });

    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.question.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}