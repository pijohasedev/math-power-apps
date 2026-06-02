import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "child") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const child = await prisma.child.findUnique({
    where: { id: session.id },
    select: { currentPoints: true, totalPointsEarned: true, totalQuestions: true, correctAnswers: true },
  });

  return NextResponse.json(child);
}