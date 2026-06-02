import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: [{ form: "asc" }, { name: "asc" }],
    include: { _count: { select: { questions: true } } },
  });
  return NextResponse.json(topics);
}

export async function POST(request: Request) {
  try {
    const { name, form, icon } = await request.json();
    if (!name || !form) {
      return NextResponse.json({ error: "Nama dan tingkatan diperlukan" }, { status: 400 });
    }
    const topic = await prisma.topic.create({
      data: { name, form: parseInt(form), icon: icon || "\uD83D\uDCD0" },
    });
    return NextResponse.json(topic, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}