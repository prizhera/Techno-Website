import { NextResponse } from "next/server";

import { getDashboardData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getDashboardData() });
}