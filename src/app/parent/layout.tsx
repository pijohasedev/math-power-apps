import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Gift,
  CheckSquare,
  Settings,
  Calculator,
  BarChart3,
} from "lucide-react";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("mathpower-session");
  if (!session || !session.value.startsWith("parent:")) {
    redirect("/login");
  }

  const navItems = [
    { href: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/children", label: "Profil Anak", icon: Users },
    { href: "/parent/topics", label: "Topik", icon: BookOpen },
    { href: "/parent/questions", label: "Soalan", icon: Calculator },
    { href: "/parent/rewards", label: "Hadiah", icon: Gift },
    { href: "/parent/redemptions", label: "Kelulusan", icon: CheckSquare },
    { href: "/parent/reports", label: "Laporan", icon: BarChart3 },
    { href: "/parent/settings", label: "Tetapan", icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-gradient-to-b from-sidebar to-sidebar/90 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-[-5rem] left-[-5rem] w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-[-3rem] right-[-3rem] w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="p-4 border-b border-sidebar-border relative z-10">
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <div className="bg-sidebar-primary/30 rounded-xl p-1.5">
              <Calculator className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="font-heading text-lg text-sidebar-foreground">MathPower</span>
              <p className="text-xs text-sidebar-accent-foreground -mt-0.5">Panel Ibu Bapa</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1 relative z-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border relative z-10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-white to-accent/10 p-6">{children}</main>
    </div>
  );
}