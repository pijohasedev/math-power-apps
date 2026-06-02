import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { role, pin } = await request.json();

    if (!role || !pin) {
      return NextResponse.json({ error: "Sila pilih peranan dan masukkan PIN" }, { status: 400 });
    }

    if (role !== "parent" && role !== "child") {
      return NextResponse.json({ error: "Peranan tidak sah" }, { status: 400 });
    }

    if (typeof pin !== "string" || pin.length < 4) {
      return NextResponse.json({ error: "PIN tidak sah" }, { status: 400 });
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst();
      if (!parent) {
        return NextResponse.json({ error: "Tiada akaun ibu bapa. Sila hubungi pentadbir." }, { status: 401 });
      }
      if (!compareSync(pin, parent.pin)) {
        return NextResponse.json({ error: "PIN salah. Sila cuba lagi." }, { status: 401 });
      }
      await setSession("parent", parent.id);
      return NextResponse.json({ success: true, name: parent.name, role: "parent" });
    }

    if (role === "child") {
      const child = await prisma.child.findFirst({
        where: { pin: { equals: pin } },
      });
      if (!child) {
        return NextResponse.json({ error: "PIN salah. Sila cuba lagi." }, { status: 401 });
      }
      await setSession("child", child.id);
      return NextResponse.json({ success: true, name: child.name, role: "child" });
    }

    return NextResponse.json({ error: "Ralat tidak diketahui" }, { status: 500 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ralat pelayan. Sila cuba lagi." }, { status: 500 });
  }
}