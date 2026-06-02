import { NextResponse } from "next/server";
import { compareSync, hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { currentPin, newPin } = await request.json();
    if (!currentPin || !newPin || newPin.length < 4) {
      return NextResponse.json({ error: "PIN baru mesti sekurang-kurangnya 4 aksara" }, { status: 400 });
    }
    const parent = await prisma.parent.findFirst();
    if (!parent) return NextResponse.json({ error: "Tiada akaun" }, { status: 404 });
    if (!compareSync(currentPin, parent.pin)) {
      return NextResponse.json({ error: "PIN semasa salah" }, { status: 400 });
    }
    await prisma.parent.update({
      where: { id: parent.id },
      data: { pin: hashSync(newPin, 10) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}