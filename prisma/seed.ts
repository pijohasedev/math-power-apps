import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashSync } from "bcryptjs";
import "dotenv/config";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const parent = await prisma.parent.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Admin", pin: hashSync("1234", 10) },
  });
  console.log("Parent seeded:", parent.name);

  const existingConfig = await prisma.pointConfig.findUnique({ where: { id: 1 } });
  if (!existingConfig) {
    await prisma.pointConfig.create({
      data: { easyPoints: 1, mediumPoints: 2, hardPoints: 3 },
    });
    console.log("PointConfig seeded.");
  }

  const existingRewards = await prisma.reward.count();
  if (existingRewards === 0) {
    await prisma.reward.createMany({
      data: [
        { name: "30 Minit Game", description: "Main game selama 30 minit di komputer", pointsRequired: 10, icon: "\uD83C\uDFAE" },
        { name: "1 Jam Game", description: "Main game selama 1 jam di komputer", pointsRequired: 20, icon: "\uD83D\uDD79\uFE0F" },
        { name: "Aiskrim", description: "Satu aiskrim pilihan", pointsRequired: 5, icon: "\uD83C\uDF66" },
        { name: "Main Luar 30 Minit", description: "Keluar main di luar 30 minit", pointsRequired: 3, icon: "\u26BD" },
      ],
    });
    console.log("Default rewards seeded.");
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });