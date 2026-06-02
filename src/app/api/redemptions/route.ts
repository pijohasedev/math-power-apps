import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "parent") {
    const redemptions = await prisma.redemption.findMany({
      include: {
        child: { select: { id: true, name: true, avatarColor: true } },
        reward: { select: { id: true, name: true, icon: true, pointsRequired: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(redemptions);
  }

  const redemptions = await prisma.redemption.findMany({
    where: { childId: session.id },
    include: {
      reward: { select: { id: true, name: true, icon: true, pointsRequired: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(redemptions);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "child") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rewardId } = await request.json();
    if (!rewardId) {
      return NextResponse.json({ error: "rewardId diperlukan" }, { status: 400 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: parseInt(rewardId) },
    });
    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "Hadiah tidak dijumpai atau tidak aktif" }, { status: 404 });
    }

    const child = await prisma.child.findUnique({ where: { id: session.id } });
    if (!child) {
      return NextResponse.json({ error: "Profil anak tidak dijumpai" }, { status: 404 });
    }

    if (child.currentPoints < reward.pointsRequired) {
      return NextResponse.json({ error: "Point tidak mencukupi" }, { status: 400 });
    }

    const redemption = await prisma.$transaction(async (tx) => {
      await tx.child.update({
        where: { id: session.id },
        data: { currentPoints: { decrement: reward.pointsRequired } },
      });
      return tx.redemption.create({
        data: {
          childId: session.id,
          rewardId: reward.id,
          points: reward.pointsRequired,
          status: "pending",
        },
        include: { reward: true },
      });
    });

    return NextResponse.json(redemption, { status: 201 });
  } catch (error) {
    console.error("Redemption error:", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}