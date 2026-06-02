import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareAnswers } from "@/lib/math";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "child") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionId, answer } = await request.json();

    if (!questionId || answer === undefined) {
      return NextResponse.json({ error: "questionId dan answer diperlukan" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });
    if (!question) {
      return NextResponse.json({ error: "Soalan tidak dijumpai" }, { status: 404 });
    }

    const isCorrect = compareAnswers(answer, question.correctAnswer);
    const points = isCorrect ? question.points : 0;

    await prisma.attempt.create({
      data: {
        childId: session.id,
        questionId: question.id,
        answerGiven: answer,
        isCorrect,
        pointsEarned: points,
      },
    });

    await prisma.child.update({
      where: { id: session.id },
      data: {
        totalQuestions: { increment: 1 },
        correctAnswers: isCorrect ? { increment: 1 } : undefined,
        currentPoints: { increment: points },
        totalPointsEarned: isCorrect ? { increment: points } : undefined,
      },
    });

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      pointsEarned: points,
    });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}