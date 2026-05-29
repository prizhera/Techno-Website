"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageTitleByPath: Record<string, string> = {
  "/dashboard": "Teacher Dashboard",
  "/classes": "Class Management",
  "/assessments": "Create Assessment",
  "/question-analysis": "Question Analysis",
  "/analytics": "Analytics",
  "/students": "Student Dashboard",
  "/settings": "Settings",
};

const pageSubtitleByPath: Record<string, string> = {
  "/classes": "Create classes and upload student rosters for analytics grouping.",
  "/question-analysis": "Analyze recurring mistake patterns by assessment and question.",
  "/assessments": "Manage assessments, create questions, and launch analysis.",
};

export function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {pageTitleByPath[pathname] ?? "Analytics Platform"}
          </h1>
          {pageSubtitleByPath[pathname] ? (
            <p className="text-sm text-slate-500">{pageSubtitleByPath[pathname]}</p>
          ) : null}
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Search class, topic, question..." />
          </div>
          <Button variant="outline" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}