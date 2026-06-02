import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, pin, form, avatarColor } = await request.json();
    const childId = parseInt(id);

    if (pin) {
      const existing = await prisma.child.findFirst({
        where: { pin, id: { not: childId } },
      });
      if (existing) {
        return NextResponse.json({ error: "PIN ini sudah digunakan" }, { status: 400 });
      }
    }

    const child = await prisma.child.update({
      where: { id: childId },
      data: { name, pin, form: form ? parseInt(form) : undefined, avatarColor },
    });
    return NextResponse.json(child);
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.child.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}