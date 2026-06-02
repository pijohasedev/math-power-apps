import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const parents = await prisma.parent.findMany();
  const config = await prisma.pointConfig.findMany();
  const rewards = await prisma.reward.findMany();
  console.log("Parents:", JSON.stringify(parents, null, 2));
  console.log("PointConfig:", JSON.stringify(config, null, 2));
  console.log("Rewards:", JSON.stringify(rewards, null, 2));
  await prisma.$disconnect();
}
main();
