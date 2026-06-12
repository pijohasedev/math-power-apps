import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Star,
  ShoppingBag,
  Calculator,
  Sparkles,
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
    { href: "/child/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-blue-400 to-blue-500" },
    { href: "/child/quiz", label: "Kuiz", icon: BookOpen, color: "from-purple-400 to-pink-500" },
    { href: "/child/points", label: "Point Saya", icon: Star, color: "from-yellow-400 to-orange-400" },
    { href: "/child/shop", label: "Kedai Hadiah", icon: ShoppingBag, color: "from-green-400 to-teal-500" },
  ];

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-[-3rem] left-[-3rem] w-48 h-48 bg-white rounded-full float-anim" />
          <div className="absolute bottom-[-2rem] right-[-2rem] w-36 h-36 bg-yellow-200 rounded-full float-anim" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-[-1.5rem] w-24 h-24 bg-green-200 rounded-full float-anim" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/3 left-[-1rem] w-16 h-16 bg-pink-200 rounded-full" />
        </div>

        <div className="p-5 border-b border-white/15 relative z-10">
          <Link href="/child/dashboard" className="flex items-center gap-3">
            <div className="bg-white/20 rounded-2xl p-2 backdrop-blur-sm">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-heading text-xl text-white">MathPower</span>
              <p className="text-xs text-white/60 -mt-0.5">Panel Pelajar</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-2 relative z-10 pt-4">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/85 hover:text-white hover:bg-white/20 transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading text-base">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/15 relative z-10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gradient-to-br from-sky-50 via-white to-purple-50 p-6">{children}</main>
    </div>
  );
}
