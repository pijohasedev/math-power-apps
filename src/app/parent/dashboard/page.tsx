import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Gift, BarChart3 } from "lucide-react";
import { ParentDashboardCharts } from "@/components/parent/ParentDashboardCharts";

export default async function ParentDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mathpower-session");
  const parentId = parseInt(session?.value.split(":")[1] || "0");

  const parent = await prisma.parent.findUnique({ where: { id: parentId } });
  const childCount = await prisma.child.count();
  const topicCount = await prisma.topic.count();
  const rewardCount = await prisma.reward.count();
  const pendingRedemptions = await prisma.redemption.count({
    where: { status: "pending" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selamat Datang, {parent?.name}</h1>
        <p className="text-muted-foreground">Panel kawalan MathPower</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profil Anak</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Topik</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hadiah</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Kelulusan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRedemptions}</div>
          </CardContent>
        </Card>
      </div>

      <ParentDashboardCharts />
    </div>
  );
}