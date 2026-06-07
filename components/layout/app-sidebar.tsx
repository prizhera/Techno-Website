"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  Bot,
  Sparkles,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Classes", href: "/classes", icon: Users },
  { label: "Assessments", href: "/assessments", icon: ClipboardList },
  { label: "Question Analysis", href: "/question-analysis", icon: BookOpenCheck },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const aiItems = [
  { label: "AI Chat", href: "/ai-chat", icon: Bot },
  { label: "Exam Generator", href: "/exam-generator", icon: Sparkles },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("trace_token");
    localStorage.removeItem("trace_user");
    router.push("/login");
  }

  function renderLink(item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
          active
            ? "bg-sky-600 text-white shadow"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white/90 px-5 py-4 backdrop-blur max-lg:hidden">
      <div className="mb-5 flex items-center justify-start rounded-2xl px-2 py-2">
        <Image
          src="/trace-logo.png"
          alt="TRACE"
          width={100}
          height={90}
          className="h-15 w-auto max-w-52 object-contain"
        />
      </div>

      <nav className="flex-1 space-y-1">
        <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Main</div>
        {navItems.map(renderLink)}

        <div className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">AI Tools</div>
        {aiItems.map(renderLink)}

        <div className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">System</div>
        {bottomItems.map(renderLink)}
      </nav>

      <div className="border-t border-slate-200 pt-3">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}