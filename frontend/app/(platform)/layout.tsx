"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("trace_token");
    if (!pathname.startsWith("/students") && !token) {
      router.push("/login");
    }
  }, [pathname, router]);

  if (pathname.startsWith("/students")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px]">
        <AppSidebar />
        <div className="min-h-screen flex-1">
          <TopNavbar />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}