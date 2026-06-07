import { NextResponse } from "next/server";

import { getAnalyticsData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getAnalyticsData() });
}