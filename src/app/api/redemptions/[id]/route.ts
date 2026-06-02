import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return NextResponse.json({ error: "Hanya ibu bapa boleh meluluskan" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status tidak sah" }, { status: 400 });
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: parseInt(id) },
    });
    if (!redemption) {
      return NextResponse.json({ error: "Permintaan tidak dijumpai" }, { status: 404 });
    }

    if (redemption.status !== "pending") {
      return NextResponse.json({ error: "Permintaan sudah diproses" }, { status: 400 });
    }

    if (status === "rejected") {
      await prisma.$transaction(async (tx) => {
        await tx.child.update({
          where: { id: redemption.childId },
          data: { currentPoints: { increment: redemption.points } },
        });
        await tx.redemption.update({
          where: { id: redemption.id },
          data: { status: "rejected" },
        });
      });
    } else {
      await prisma.redemption.update({
        where: { id: redemption.id },
        data: { status: "approved" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}