import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rewards = await prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } });
  return NextResponse.json(rewards);
}

export async function POST(request: Request) {
  try {
    const { name, description, pointsRequired, icon, isActive } = await request.json();
    if (!name || !pointsRequired) {
      return NextResponse.json({ error: "Nama dan point diperlukan" }, { status: 400 });
    }
    const reward = await prisma.reward.create({
      data: { name, description: description || "", pointsRequired: parseInt(pointsRequired), icon: icon || "\uD83C\uDF81", isActive: isActive ?? true },
    });
    return NextResponse.json(reward, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}