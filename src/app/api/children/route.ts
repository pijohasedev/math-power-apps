import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const children = await prisma.child.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(children);
}

export async function POST(request: Request) {
  try {
    const { name, pin, form, avatarColor } = await request.json();
    if (!name || !pin || pin.length < 4) {
      return NextResponse.json({ error: "Nama dan PIN (min 4 aksara) diperlukan" }, { status: 400 });
    }
    const existing = await prisma.child.findFirst({ where: { pin } });
    if (existing) {
      return NextResponse.json({ error: "PIN ini sudah digunakan oleh anak lain" }, { status: 400 });
    }
    const child = await prisma.child.create({
      data: { name, pin, form: form ? parseInt(form) : 1, avatarColor: avatarColor || "blue" },
    });
    return NextResponse.json(child, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}