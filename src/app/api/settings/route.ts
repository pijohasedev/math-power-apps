import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let config = await prisma.pointConfig.findFirst();
  if (!config) {
    config = await prisma.pointConfig.create({
      data: { easyPoints: 1, mediumPoints: 2, hardPoints: 3 },
    });
  }
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const { easyPoints, mediumPoints, hardPoints } = await request.json();
    let config = await prisma.pointConfig.findFirst();
    if (!config) {
      config = await prisma.pointConfig.create({
        data: { easyPoints: easyPoints ?? 1, mediumPoints: mediumPoints ?? 2, hardPoints: hardPoints ?? 3 },
      });
    } else {
      config = await prisma.pointConfig.update({
        where: { id: config.id },
        data: { easyPoints, mediumPoints, hardPoints },
      });
    }
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Ralat pelayan" }, { status: 500 });
  }
}