import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description, pointsRequired, icon, isActive } = await request.json();
    const reward = await prisma.reward.update({
      where: { id: parseInt(id) },
      data: { name, description, pointsRequired: pointsRequired ? parseInt(pointsRequired) : undefined, icon, isActive },
    });
    return NextResponse.json(reward);
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.reward.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}