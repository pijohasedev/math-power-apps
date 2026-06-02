import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Star,
  ShoppingBag,
  Calculator,
} from "lucide-react";
import { LogoutButton } from "@/components/shared/LogoutButton";

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("mathpower-session");
  if (!session || !session.value.startsWith("child:")) {
    redirect("/login");
  }

  const navItems = [
    { href: "/child/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/child/quiz", label: "Kuiz", icon: BookOpen },
    { href: "/child/points", label: "Point Saya", icon: Star },
    { href: "/child/shop", label: "Kedai Hadiah", icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-gradient-to-b from-primary/90 to-primary flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-5rem] left-[-5rem] w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-[-3rem] right-[-3rem] w-32 h-32 bg-white rounded-full" />
          <div className="absolute top-1/2 right-[-2rem] w-20 h-20 bg-accent/30 rounded-full" />
        </div>
        <div className="p-4 border-b border-white/15 relative z-10">
          <Link href="/child/dashboard" className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl p-1.5">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-heading text-lg text-white">MathPower</span>
              <p className="text-xs text-white/60 -mt-0.5">Panel Pelajar</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1 relative z-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-white/15 relative z-10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50/40 via-white to-purple-50/30 p-6">{children}</main>
    </div>
  );
}