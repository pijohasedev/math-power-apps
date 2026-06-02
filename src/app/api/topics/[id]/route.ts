import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, form, icon } = await request.json();
    const topic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: { name, form: form ? parseInt(form) : undefined, icon },
    });
    return NextResponse.json(topic);
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.topic.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}